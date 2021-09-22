let users = []

const addUser = (id, name, room, host, score, isDrawing) => {
    const existingUser = users.find(user => user.name.trim().toLowerCase() === name.trim().toLowerCase() && user.room === room)

    if (existingUser) return { error: "Username has already been taken" }
    if (!name && !room) return { error: "Username and room are required" }
    if (!name) return { error: "Username is required" }
    if (!room) return { error: "Room is required" }

    const user = { id, name, room, host, score, isDrawing, correct: false, hasDrawn: 0 }
    users.push(user)
    return { user }
}

const getRoom = room => {
    let user = users.find(user => user.room == room)
    return user
}

const getUser = id => {
    let user = users.find(user => user.id == id)
    return user
}

const getDrawnUsers = room => {
    let list = users.filter(e => e.room == room)

    for(i =0; i < list.length; i++) {
        if(i == 0) {
            drawn = list[i].hasDrawn
        }
        if(list[i].hasDrawn != drawn) {
            return false
        }
    }
    return true
}

const getAllCorrect = room => {
    let list = users.filter(e => e.room == room)
    let allcorrect = true
    
    for(i of list) {
        if(!i.correct && !i.isDrawing) {
            allcorrect = false
            break
        }
    }
    return allcorrect
}

const getNoOfCorrects = async room => {
    let list = users.filter(e => e.room == room)
    let correctUsers = 0
    for(i of list) {
        if(i.correct) {
            correctUsers++
        }
    }
    return correctUsers
}

const editUser = (id, data) => {
    users.forEach((e, i) => {
        if(e.id == id) {
            e = {...e, ...data};
        }
    });
    return 
}

const resetUsers = async (room) => {
     users.forEach((e,i) => {
        if(e.room == room) {
            users[i].correct = false
            users[i].isDrawing = false
        }
    });
    return 
}


const deleteUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) return users.splice(index, 1)[0];
}

const deleteRoom = (room) => {
    const index = users.findIndex((e) => e.room === room);
    if (index !== -1) return users.splice(index, 1)[0];
}

const getUsers = (room) => users.filter(user => user.room === room)

const getRandomUser = (room) => {
    let user
    for(e of getUsers(room)) {
        if(e.hasDrawn == 0) {
            user = e
            break
        }
    }
    if(user) return user
}

module.exports = { addUser, getUser, deleteUser, getUsers, deleteRoom, editUser, getRandomUser, getAllCorrect, getDrawnUsers, resetUsers, getRoom, getNoOfCorrects}