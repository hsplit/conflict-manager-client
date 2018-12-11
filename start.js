let port = !isNaN(+process.argv[2]) ? +process.argv[2] : 5000

const express = require('express')
const opn = require('opn')

const app = express()

app.get('/', (request, response) => {
  response.send('<h1>Главная страница</h1>')
})

app.listen(port, _ => console.log(`start on http://localhost:${port}/`) || opn(`http://localhost:${port}/`))
