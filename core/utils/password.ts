import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRIPT_OPTIONS = {
    N: 2 ** 14,
    r:8,
    p:1
}

export class Password{
    PEPPER = 'supersecreto';

    async  hash(password:string){
        const salt = randomBytes(16);
        const passwordHmac = createHmac('sha256',this.PEPPER).update(password).digest()
        const dk = await scryptSync(passwordHmac,salt,32,SCRIPT_OPTIONS)
        
        return `${salt.toString('hex')}$${dk.toString('hex')}`
    }
    parse(password_hash: string) {
        const parts = password_hash.split("$");
        const [stored_salt_hex, stored_dk_hex] = parts;
        const stored_salt = Buffer.from(stored_salt_hex, "hex");
        const stored_dk = Buffer.from(stored_dk_hex, "hex");
        return { stored_salt, stored_dk };
    }
    
    async valid(password:string,password_hash:string){
        const { stored_salt, stored_dk } = this.parse(password_hash);
    
        const password_normalized = password.normalize("NFC");
        const password_hmac = createHmac("sha256", this.PEPPER).update(password_normalized).digest();
    
        const dk = await scryptSync(password_hmac, stored_salt, 32, SCRIPT_OPTIONS);
    
        if (dk.length !== stored_dk.length) return false;
        return timingSafeEqual(dk, stored_dk);
    }
}




    
