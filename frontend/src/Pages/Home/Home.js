import React, {useState, useRef, useEffect, useContext} from 'react'
import { Col, Row, Container }from 'react-bootstrap'
import Swal from 'sweetalert2'
import io from "socket.io-client";
import { useHistory } from 'react-router-dom'

//styles
import styles from './Home.module.css'

//components
import { MainContext } from '../../Context/mainContext';
import { UsersContext } from '../../Context/usersContext';

//backend
const socket = io('http://localhost:8000');

export default function Home() {
    const history = useHistory()
    const {name, setName, room, setRoom} = useContext(MainContext)
    const {setUsers} = useContext(UsersContext)

    const Toast = Swal.mixin({
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        showCloseButton: true,
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
    });
    useEffect(() => {   
        socket.on('message', (data) => {
            console.log(data)
        })
    })

    const username = useRef(null)
    const roomCode = useRef(null)

    const joinRoom = () => {
        let name = username.current.value
        let room = roomCode.current.value

        if(!(name.length > 0)) { 
            Toast.fire({
                icon: 'error',
                title: 'Your username is empty'
            })
            return username.current.focus()
        } 
        if(!(room.length > 0)) {
            Toast.fire({
                icon: 'error',
                title: 'Your Room Code is empty'
            })
            return roomCode.current.focus()
        }

        socket.emit('join-room', {
            username: name,
            room: room,
        })
        //emit socket to join room
    }

    const createRoom = () => {
        let name = username.current.value
        if(!(name.length > 0)) { 
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
            if(err) {
                console.log(err)
                return Toast.fire({
                    icon: 'error',
                    title: 'Cannot create room'
                })
            }
            setRoom(data.code)
            setName(data.username)
            history.push('/waiting-room')
        })
    }

    return (
        <Container className={styles.box}>
            <Row>
                <h1>Skribbl Ni Ma</h1>
            </Row>
            <Row>
                <Col>
                    Username: <input type="text" ref={username}/>
                    
                </Col>
            </Row>
            <Row>
                <Col>
                <input type="text" ref={roomCode}/>
                <button onClick={e => joinRoom()}>
                    Join Room
                    </button>
                </Col>
                <Col>
                <button onClick={e => createRoom()}>Create Room</button>
                </Col>
            </Row>
        </Container>
    )
}
