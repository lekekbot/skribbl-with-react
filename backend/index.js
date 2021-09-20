const express = require('express')
const cors = require('cors');
const http = require('http');
const randomatic = require('randomatic');
const app = express()
const { addUser, getUser, deleteUser, getUsers, deleteRoom, editUser, getRandomUser } = require('./users');
const { getWords, rmvRoom } = require('./words');

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

            const { user, error } = addUser(socket.id, username, randomizedCode, true, 0, 0)
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

            const { user, error } = addUser(socket.id, username, room, false,  0, 0)
            if (error) return callback(error,null)
            
            await socket.join(room)
            io.in(room).emit('users', getUsers(room))

            callback(null, {
                code: room,
                username: username,
            })
        })

        //start game 
        socket.on('start-game', async (data) => {
            io.in(data.room).emit('client-game-start')
        })

        socket.on('game-setup', async (data) => {
            let selectedUser = getRandomUser(data.room)
            let words = getWords(data.room)
            await io.in(data.room).emit('users', getUsers(data.room))

            io.in(data.room).emit('client-game-setup',{
                drawer: selectedUser.id,
                words: words
            })

        })
        
        //chat message
        socket.on('send-message', async (data, callback) => {
            //check for correct answer

            //if not correct answer just send out message
            io.in(data.room).emit('client-send-message', {name: data.username, message: data.message})
        })

        //drawing socket
        socket.on('send-drawing', async (data) => {
            socket.to(data.room).emit('drawing', {x:data.x, y: data.y, size: data.size, color: data.color})
        })

        socket.on('mouse-up', async (data) => {
            socket.to(data.room).emit('mouseUp')
        })

        //canvas clear
        socket.on('clear-drawing', async (data) => {
            socket.to(data.room).emit('clear')
        })

        //when user refresh, close browser 
        socket.on("disconnecting", () => {
            const user = deleteUser(socket.id)
            if (user) {
                //if host, delete room completely
                if(user.host) {                
                    deleteRoom(user.room)
                    rmvRoom(user.room)
                    io.in(user.room).emit('remove-room')
                    io.in(user.room).emit('notification', { title: 'Host has left', description: `Start a new game.` })
                } else {
                //delete user only 
                    io.in(user.room).emit('notification', { title: 'Someone just left', description: `${user.name} just left the room` })
                    io.in(user.room).emit('users', getUsers(user.room))
                }
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