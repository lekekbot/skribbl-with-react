const express = require('express')
const cors = require('cors');
const http = require('http');
const randomatic = require('randomatic');
const app = express()
const { addUser, getUser, deleteUser, getUsers, gay } = require('./users')


const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
})

const sockets = io => {
    io.on('connection', (socket) => {

        //create room
        socket.on('create-room', async (data, callback) => {
            let randomizedCode = randomatic('aA0', 8);
            let username = data.username

            const { user, error } = addUser(socket.id, username, randomizedCode)
            if (error) return callback(error,null)

            socket.join(randomizedCode)
            io.in(randomizedCode).emit('users', getUsers(randomizedCode))

            callback(null, {
                code: randomizedCode,
                username: username,
            })

        })

        //join room
        socket.on('join-room', async (data, callback) => {
            let room = data.room
            let username = data.username

            const { user, error } = addUser(socket.id, username, room)
            if (error) return callback(error,null)
            
            socket.join(room)
            io.in(room).emit('users', getUsers(room))

            callback(null, {
                code: room,
                username: username,
            })
        })
    })
}

sockets(io)


app.use(cors())
server.listen(8000, err => {
    if (err) return console.log(`Cannot Listen on PORT: 8000`);
    console.log(`Server is Listening on: http://localhost:8000/`);
});