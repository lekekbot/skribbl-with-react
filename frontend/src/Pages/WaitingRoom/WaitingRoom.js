import React, {useContext, useEffect, useState} from 'react'
import { Col, Row, Container }from 'react-bootstrap'
import io from "socket.io-client";
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
    }, [socket])

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
                    <button>Start Game</button>
                }
                <button>Quit</button>


            </Row>
        </Container>
    )
})

export default WaitingRoom