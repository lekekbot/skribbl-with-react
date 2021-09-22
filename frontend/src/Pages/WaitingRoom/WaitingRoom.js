import React, { useContext, useEffect, useState } from 'react'
import { Button, Col, Row, Container, ListGroup } from 'react-bootstrap'
import { withRouter } from "react-router";

//styles
import styles from './WaitingRoom.module.css'

//components
import { MainContext } from '../../Context/mainContext';
import { UsersContext } from '../../Context/usersContext';
import { SocketContext } from '../../Context/socketContext';
import Toast from '../../Shared/swal'

const WaitingRoom = withRouter(({ history }) => {
    const { users, setUsers } = useContext(UsersContext)
    const { name, setName, room, setRoom } = useContext(MainContext)

    const [host] = useState(history.location.state.host)
    const socket = useContext(SocketContext)

    useEffect(() => {
        socket.on("notification", notif => {
            Toast.fire({
                title: notif?.title,
                html: notif?.description,
                icon: 'info'
            })
        })

        socket.on('client-game-start', () => {
            history.push('/game', {
                host: host
            })
        })

        socket.on('remove-room', () => {
            history.push('/')
        })
        
        if(room) {
            if(host) {
                socket.emit('game-setup', {
                    room: room
                })
            }
        } else {
            // dev will comment off
            history.push('/')
        }
    }, [socket])

    const startGame = () => {
        socket.emit('start-game', {
            room: room
        })
    }

    const quit = async () => {
        await socket.emit('user-quit')
        history.push('/')
    }

    const getUsers = () => {
        return users.length > 0 ?
            users.map(e => (
                <Col md={3} className={styles.usersName} key={Math.random()}>{e.name}</Col>
            ))
            : ''
    }

    //useeffect to get users, on etc. etc.
    return (
        <div className={styles.box}>
                <h1 className={styles.roomCode}>Room Code: {room}</h1>
            <Container className={styles.roomBox}>
                <Row>
                    <h1 className={styles.usersHeader}>Users Joined: {users.length}</h1>
                </Row>
                <Row className={styles.usersList}>
                    <Col>
                        <Row className={styles.centering}>
                            {getUsers()}
                        </Row>
                    </Col>
                </Row>
                <br/>
                <Row className={styles.centering}>
                    <Col>
                        {host &&
                            <Button className={styles.button} style={{ background: "dodgerblue" }} onClick={() => startGame()}>Start Game</Button>
                        }
                        <Button className={styles.button} style={{ background: "red" }} onClick={() => quit()}>Quit</Button>
                    </Col>
                </Row>
            </Container>
        </div>
    )
})

export default WaitingRoom