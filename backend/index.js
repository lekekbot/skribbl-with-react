const express = require('express')
const cors = require('cors');
const http = require('http');
const randomatic = require('randomatic');
const app = express()
const {
    addUser,
    getUser,
    deleteUser,
    getUsers,
    deleteRoom,
    editUser,
    getRandomUser,
    getAllCorrect,
    getDrawnUsers,
    resetUsers,
    getRoom,
    getNoOfCorrects
} = require('./users');
const {
    getWords,
    rmvRoom,
    selectedWord,
    getSelectedWord
} = require('./words');
const {
    MIN_POINTS,
    MAX_POINTS
} = require('./config')

const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
})

//io = all users
//socket = user who emitted/ will be emitted
const sockets = io => {
    io.on('connection', (socket) => {

        //create room
        socket.on('create-room', async (data, callback) => {
            let randomizedCode = randomatic('A0', 8);
            let username = data.username

            const {
                user,
                error
            } = addUser(socket.id, username, randomizedCode, true, 0, 0)
            if (error) return callback(error, null)

            await socket.join(randomizedCode)

            callback(null, {
                code: randomizedCode,
                username: username,
            })

            io.in(randomizedCode).emit('users', getUsers(randomizedCode))
            io.in(randomizedCode).emit('usernames', getUsers(randomizedCode))
        })

        //join room
        socket.on('join-room', async (data, callback) => {
            let room = data.room
            let username = data.username

            let existingRoom = getRoom()
            if (!existingRoom) {
                return socket.emit('notification', {
                    title: 'Room Code Error!',
                    description: 'No such code exists, try again.'
                })
            }
            const {
                user,
                error
            } = addUser(socket.id, username, room, false, 0, 0)
            if (error) return callback(error, null)

            await socket.join(room)
            callback(null, {
                code: room,
                username: username,
            })

            io.in(room).emit('users', getUsers(room))
            io.in(room).emit('usernames', getUsers(room))

        })

        //start game 
        socket.on('start-game', async (data) => {
            io.in(data.room).emit('client-game-start')
        })

        socket.on('game-setup', async (data) => {
            let {
                room
            } = data
            let selectedUser = getRandomUser(room)
            let words = getWords(room)
            await io.in(room).emit('users', getUsers(room))

            selectedUser.isDrawing = true
            selectedUser.hasDrawn = selectedUser.hasDrawn + 1

            editUser(selectedUser.id, selectedUser)

            io.in(room).emit('client-game-setup', {
                drawer: selectedUser.id,
                words: words
            })
        })

        socket.on('start-round', async (data) => {
            let {
                room,
                word
            } = data
            let time = 100
            let score = MAX_POINTS
            selectedWord(room, word)

            //make words to _ _ _ _
            let noWords = ''
            for (i = 0; i < word.length; i++) {
                noWords += '_'
            }

            let timer = setInterval(async () => {
                let users = getUsers(room)
                await io.in(room).emit('users', users)
                
                if (time < 80) {
                    score = Math.round(score * (time / 100))
                }
                
                // if all users get correct
                let allCorrect = getAllCorrect(room)
                if (allCorrect) {
                    clearInterval(timer)
                    let correctUsers = getNoOfCorrects(room)
                    let drawScore = Math.round((correctUsers/ (users.length - 1)) * MAX_POINTS)
                    
                    return io.in(room).emit('round-over', {
                        word: word
                    })
                }

                //game over if timer hits 0
                if (time == 0) {
                    clearInterval(timer)
                    return io.in(room).emit('round-over', {
                        word: word
                    })

                } else if (time == Math.floor(99 / 2)) {
                    //give hint
                    noWords = ''
                    let randomLetter = Math.floor(Math.random() * word.length)
                    for (i = 0; i < word.length; i++) {
                        if (i == randomLetter) {
                            noWords += word[i]
                        } else {
                            noWords += '_'
                        }
                    }
                }
                io.in(data.room).emit('time', {
                    time: time,
                    word: noWords
                })
                time--
            }, 1000);
        })

        socket.on('next-round', async (data) => {
            let {
                room
            } = data
            //get x ppl if is drawing
            let drawnUsers = getDrawnUsers(room)
            await resetUsers(room)
            socket.to(room).emit('clear')
            socket.to(room).emit('clear-chat')

            if (drawnUsers) {
                return io.in(room).emit('end-game')
            } else {
                let selectedUser = getRandomUser(room)
                let words = getWords(room)
                await io.in(room).emit('users', getUsers(room))

                selectedUser.isDrawing = true
                selectedUser.hasDrawn = selectedUser.hasDrawn + 1
                editUser(selectedUser.id, selectedUser)

                io.in(data.room).emit('client-game-setup', {
                    drawer: selectedUser.id,
                    words: words
                })
            }
        })

        //chat message
        socket.on('send-message', async (data) => {
            //check for correct answer
            let {
                room,
                username,
                message
            } = data
            if (data.message.toUpperCase() == getSelectedWord(room)) {
                //answers correctly
                let user = getUser(socket.id)

                user.correct = true
                editUser(socket.id, user)

                io.in(room).emit('client-correct', {
                    message: `${username} has answer correctly!`
                })
                socket.emit('disable-user-message', {})
            } else {
                //if not correct answer just send out message
                io.in(room).emit('client-send-message', {
                    name: username,
                    message: message
                })
            }
        })

        //drawing socket
        socket.on('send-drawing', async (data) => {
            socket.to(data.room).emit('drawing', {
                x: data.x,
                y: data.y,
                size: data.size,
                color: data.color
            })
        })

        socket.on('mouse-up', async (data) => {
            socket.to(data.room).emit('mouseUp')
        })

        //canvas clear
        socket.on('clear-drawing', async (data) => {
            socket.to(data.room).emit('clear')
        })

        socket.on('user-quit', () => {
            const user = deleteUser(socket.id)

            if (user) {
                //if host, delete room completely
                let {
                    host,
                    room,
                    name
                } = user
                if (host) {
                    deleteRoom(room)
                    rmvRoom(room)
                    io.in(room).emit('remove-room')
                    io.in(room).emit('notification', {
                        title: 'Host has left',
                        description: `Start a new game.`
                    })
                } else {
                    //delete user only 
                    io.in(room).emit('notification', {
                        title: 'Someone just left',
                        description: `${name} just left the room`
                    })
                    io.in(room).emit('users', getUsers(room))
                    io.in(room).emit('usernames', getUsers(room))
                }
            }
        })

        //when user refresh, close browser 
        socket.on("disconnecting", () => {
            const user = deleteUser(socket.id)

            if (user) {
                //if host, delete room completely
                let {
                    host,
                    room,
                    name
                } = user
                if (host) {
                    deleteRoom(room)
                    rmvRoom(room)
                    io.in(room).emit('remove-room')
                    io.in(room).emit('notification', {
                        title: 'Host has left',
                        description: `Start a new game.`
                    })
                } else {
                    //delete user only 
                    io.in(room).emit('notification', {
                        title: 'Someone just left',
                        description: `${name} just left the room`
                    })
                    io.in(room).emit('users', getUsers(room))
                    io.in(room).emit('usernames', getUsers(room))
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