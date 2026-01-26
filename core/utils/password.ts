import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRIPT_OPTIONS = {
    N: 2 ** 14,
    r:8,
    p:1
}
const PEPPER = 'supersecreto';

export class Password{

    async passwordHash(password:string){
        const salt = randomBytes(16);
        const passwordHmac = createHmac('sha256',PEPPER).update(password).digest()
        const dk = await scryptSync(passwordHmac,salt,32,SCRIPT_OPTIONS)
        
        return `${salt.toString('hex')}$${dk.toString('hex')}`
    }

    parsePasswordHash(password_hash: string) {
        const parts = password_hash.split("$");
        const [stored_salt_hex, stored_dk_hex] = parts;
        const stored_salt = Buffer.from(stored_salt_hex, "hex");
        const stored_dk = Buffer.from(stored_dk_hex, "hex");
        return { stored_salt, stored_dk };
}

    async hashHmac(password:string,password_hash:string){

        const { stored_salt, stored_dk } = this.parsePasswordHash(password_hash);

        const password_normalized = password.normalize("NFC");
         const password_hmac = createHmac("sha256", PEPPER).update(password_normalized).digest();

        const dk = await scryptSync(password_hmac, stored_salt, 32, SCRIPT_OPTIONS);

        if (dk.length !== stored_dk.length) return false;

        return timingSafeEqual(dk, stored_dk);
    }

    async init(password:string){
        const password_hashed = await this.passwordHash(password)
        const valid =  await this.hashHmac(password,password_hashed)
        return valid
    }
    
}
console.log(await new Password().init('rafa'))