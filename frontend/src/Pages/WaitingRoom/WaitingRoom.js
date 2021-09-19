import React, {useContext, useEffect, useState} from 'react'
import { Col, Row, Container }from 'react-bootstrap'
import { withRouter } from "react-router";

//styles
import styles from './WaitingRoom.module.css'

//components
import { MainContext } from '../../Context/mainContext';
import { UsersContext } from '../../Context/usersContext';
import { SocketContext } from '../../Context/socketContext';
import Toast from '../../Shared/swal'

const WaitingRoom =  withRouter(({ history }) => {
    const {users, setUsers} = useContext(UsersContext)
    const {name, setName, room, setRoom} = useContext(MainContext)

    const [host] = useState(history.location.state.host)
    const socket = useContext(SocketContext)

    useEffect(() => {
        socket.on("notification", notif => {
            Toast.fire({
                title: notif?.title,
                text: notif?.description,
                status: "success",
            })
        })

        socket.on('client-game-start', () => {
            history.push('/game')
        })

        socket.on('remove-room', () => {
            history.push('/')
        })
    }, [socket])

    const startGame = () => {
        history.push('/game')
        socket.emit('start-game', {
            room: room
        })
    }

    //useeffect to get users, on etc. etc.
    return (
        <Container className={styles.box}>
            <div>Room Code: {room}</div>
            <br/>
            <Row className={styles.usersTable}>
                <h1>Users Joined:</h1>
                <ul>
                    {users.length > 0 ?
                        users.map((e,i) => (
                            <li key={i}>{e.name}</li>
                        ))    
                    : ''}
                </ul>
            </Row>
            <Row>
                {host &&
                    <button onClick={() => startGame()}>Start Game</button>
                }
                <button>Quit</button>


            </Row>
        </Container>
    )
})

export default WaitingRoom