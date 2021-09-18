const express = require('express')
const cors = require('cors');
const http = require('http');
const randomatic = require('randomatic');
const app = express()
const { addUser, getUser, deleteUser, getUsers } = require('./users')


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
            let randomizedCode = randomatic('A0', 8);
            let username = data.username

            const { user, error } = addUser(socket.id, username, randomizedCode, true)
            if (error) return callback(error,null)

            await socket.join(randomizedCode)
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
            
            await socket.join(room)
            io.in(room).emit('users', getUsers(room))

            callback(null, {
                code: room,
                username: username,
            })
        })

        socket.on('start-game', (data) => {
            io.in(data.room).emit('client-game-start')
        })
        
        socket.on('send-message', async (data, callback) => {
            io.in(data.room).emit('client-send-message', {name: data.username, message: data.message})
        })

        socket.on("disconnecting", () => {
            console.log("User disconnected");
            const user = deleteUser(socket.id)
            if (user) {
                io.in(user.room).emit('notification', { title: 'Someone just left', description: `${user.name} just left the room` })
                io.in(user.room).emit('users', getUsers(user.room))
            }
        })
    })
}

sockets(io)

app.use(cors())
server.listen(8000, err => {
    if (err) return console.log(`Cannot Listen on PORT: 8000`);
    console.log(`Server is Listening on: http://localhost:8000/`);
});