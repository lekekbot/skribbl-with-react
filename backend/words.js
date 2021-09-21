const randomWords = require('random-words');
const rooms = {}

//room settings implmented later
const getWords = (room) => {

    if (rooms.hasOwnProperty(room)) {
        rooms[room].word = []
        let words = randomWords({exactly: 3, formatter: (word)=> word.toUpperCase()})
        rooms[room].word.push(words)
        return(rooms[room].word)
    } else {
        rooms[room] = {
            word: []
        }
        let words = randomWords({exactly: 3, formatter: (word)=> word.toUpperCase()})
        rooms[room].word.push(words)
        return(rooms[room].word)
    }
}

const selectedWord = (room, word) => {
    console.log(rooms)
    rooms[room].selectedWord = word
    return
}

const getSelectedWord = (room) => {
    return rooms[room].selectedWord
}

const rmvRoom = (room) => {
    delete rooms[room]
}

module.exports = {getWords, rmvRoom, selectedWord, getSelectedWord}