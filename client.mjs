const URL = 'http://localhost:3000/'


const response2 = await fetch(URL + 'auth/login',{
    method:'POST',
    headers:{
        'Content-Type': 'application/json'
    },
    body:JSON.stringify({email:'rafa@gmail.com',password:'rfa'})
})
const dados2 = await response2.json()
console.log(dados2)