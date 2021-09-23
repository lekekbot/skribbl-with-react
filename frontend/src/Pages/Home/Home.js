import React, { useState, useRef, useEffect, useContext } from 'react'
import { Col, Row, Container } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

//styles
import styles from './Home.module.css'

//components
import { MainContext } from '../../Context/mainContext';
import { UsersContext } from '../../Context/usersContext';
import { SocketContext } from '../../Context/socketContext';
import Toast from '../../Shared/swal'

//backend
export default function Home() {
    const history = useHistory()
    const { name, setName, room, setRoom } = useContext(MainContext)
    const { setUsers } = useContext(UsersContext)
    const socket = useContext(SocketContext)

    useEffect(() => {
        socket.on("users", users => {
            setUsers(users)
        })
    })

    useEffect(() => {
        socket.on("notification", notif => {
            Toast.fire({
                title: notif?.title,
                html: notif?.description,
                icon: 'info'
            })
        })
    }, [socket])

    const username = useRef(null)
    const roomCode = useRef(null)

    const joinRoom = () => {
        let name = username.current.value
        let room = roomCode.current.value

        if (!(name.length > 0)) {
            Toast.fire({
                icon: 'error',
                title: 'Your username is empty'
            })
            return username.current.focus()
        }
        if (!(room.length > 0)) {
            Toast.fire({
                icon: 'error',
                title: 'Your Room Code is empty'
            })
            return roomCode.current.focus()
        }

        socket.emit('join-room', {
            username: name,
            room: room,
        }, (err, data) => {
            if (err) {
                console.log(err)
                return Toast.fire({
                    icon: 'error',
                    title: 'Cannot join room'
                })
            }
            setRoom(data.code)
            setName(data.username)
            history.push('/room', {
                host: false
            })
        })
        //emit socket to join room
    }

    const createRoom = () => {
        let name = username.current.value
        if (!(name.length > 0)) {
            Toast.fire({
                icon: 'error',
                title: 'Your username is empty'
            })
            return username.current.focus()
        }

        //socket 
        // push to waiting room for people to join 
        socket.emit('create-room', {
            username: name,
        }, (err, data) => {
            if (err) {
                console.log(err)
                return Toast.fire({
                    icon: 'error',
                    title: 'Cannot create room'
                })
            }
            setRoom(data.code)
            setName(data.username)
            history.push('/room', {
                host: true
            })
        })
    }

    return (
        <div className={styles.box}>
            <Container className={styles.formBox}>
                <Row>
                    <h1 className={styles.textHeader}>Skribbl Ni Ma</h1>
                </Row>
                <Row>
                    <Col>
                        <div className={styles.textHeader}>USERNAME:</div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <input type="text" ref={username} className={styles.textField} placeholder="Enter Your Name"/>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className={styles.textHeader}>ROOM CODE:</div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <input type="text" ref={roomCode} className={styles.textField} placeholder="Enter The Room Code"/>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <button onClick={e => joinRoom()} style={{ background: "dodgerblue" }} className={styles.button}>
                            Join Room
                        </button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <button onClick={e => createRoom()} style={{ background: "limegreen" }} className={styles.button}>
                            Create Room
                        </button>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
