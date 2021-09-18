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
            let randomizedCode = randomatic('aA0', 8);
            let username = data.username

            const {user, error } = addUser(socket.id, username, randomizedCode)
            if (error) return callback(error,null)

            socket.join(randomizedCode)

            // return socket.emit('room-created', {
            //     code: randomizedCode,
            //     username: username,
            // })
            callback(null, {
                code: randomizedCode,
                username: username,
            })
        })

        //join room
        socket.on('join-room', async (data) => {
            let code = data.room
            let username = data.username

            socket.join(code)
            const {user, error } = addUser(socket.id, username, code)

            io.to(code).emit('return-users', getUsers(code))
            
            return socket.to(code).emit('message', getUsers(code))
        })

        //get users 
        socket.on('users', (data)=> {
            let room = data.room
            console.log(getUsers(room))
            io.to(code).emit('return-users', getUsers(room))

        })
    })
}

sockets(io)


app.use(cors())
server.listen(8000, err => {
    if (err) return console.log(`Cannot Listen on PORT: 8000`);
    console.log(`Server is Listening on: http://localhost:8000/`);
});