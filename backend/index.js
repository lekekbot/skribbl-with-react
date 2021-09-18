const express = require('express')
const cors = require('cors');
const http = require('http');
const app = express()

const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
})

const sockets = io => {
    io.on('connection', (socket) => {
        //store id
        socket.on('send-id', async (data) => {
            clientInfo = {
                userid: data.userid,
                socketid: data.socketid
            }
            clients.push(clientInfo)
        })
    })
}

sockets(io)


app.use(cors())
server.listen(8000, err => {
    if (err) return console.log(`Cannot Listen on PORT: 8000`);
    console.log(`Server is Listening on: http://localhost:8000/`);
});