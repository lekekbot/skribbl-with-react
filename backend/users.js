const users = []

const addUser = (id, name, room, host, score, isDrawing) => {
    const existingUser = users.find(user => user.name.trim().toLowerCase() === name.trim().toLowerCase() && user.room === room)

    if (existingUser) return { error: "Username has already been taken" }
    if (!name && !room) return { error: "Username and room are required" }
    if (!name) return { error: "Username is required" }
    if (!room) return { error: "Room is required" }

    const user = { id, name, room, host, score, isDrawing }
    users.push(user)
    return { user }
}

const getUser = id => {
    let user = users.find(user => user.id == id)
    return user
}

const editUser = (id, data) => {
    users.forEach((e, i) => {
        if(e.id == id) {
            e[i] = {...e, ...data};
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
        if(e.isDrawing == 0) {
            user = e
            break
        } else if(e.isDrawing == 1) {
            continue
        }
    }
    if(user) {
        return user
    } else return false
}

module.exports = { addUser, getUser, deleteUser, getUsers, deleteRoom, editUser, getRandomUser}