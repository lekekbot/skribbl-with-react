const randomWords = require('random-words');
const rooms = {}

//room settings implmented later
const getWords = (room) => {

    if (rooms.hasOwnProperty(room)) {
        rooms[room].word = []
        let words = randomWords({exactly: 3, formatter: (word)=> word.toUpperCase()})
        rooms[room].word.push(words)
        rooms[room].timer = 100
        rooms[room].current_score = 0
    } else {
        rooms[room] = {
            word: []
        }
        rooms[room].timer = 100
        rooms[room].current_score = 0
        let words = randomWords({exactly: 3, formatter: (word)=> word.toUpperCase()})
        rooms[room].word.push(words)
    }
    return(rooms[room].word)
}

const selectedWord = (room, word) => {
    rooms[room].selectedWord = word
    return
}

const getSelectedWord = (room) => {
    return rooms[room].selectedWord
}

const setScore = (room, score)=> {
    return rooms[room].current_score = score
}

const getScore = (room)=> {
    return rooms[room].current_score
}

const setTimer = (room, timer)=> {
    return rooms[room].timer = timer
}

const getTimer = (room)=> {
    return rooms[room].timer
}

const rmvRoom = (room) => {
    delete rooms[room]
    return
}

module.exports = {getWords, rmvRoom, selectedWord, getSelectedWord, setScore, getScore, setTimer, getTimer}