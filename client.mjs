const URL = 'http://localhost:3000'

const response = await fetch(URL + '/auth/update/password',{
    method:'PUT',
    headers:{
        'Content-Type': 'application/json'
    },
    body:JSON.stringify({email:'ana@origamid.com',password:'rafa123',new_password:'123'})
})
const dados = await response.json()
console.log(dados)