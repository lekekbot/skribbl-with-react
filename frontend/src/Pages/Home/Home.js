import React, {useState, useRef} from 'react'
import { Col, Row, Container }from 'react-bootstrap'
import styles from './Home.module.css'
import Swal from 'sweetalert2'

export default function Home() {
    const Toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        showCloseButton: true,
        timer: 2500,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
    });
    
    const username = useRef(null)

    const joinRoom = e => {
        let name = username.current.value
        if(name.length > 0) {

        } else {
            Toast.fire({
                icon: 'error',
                title: 'Your username is empty'
            })
            console.log(username.current.value)
            username.current.focus()
        }
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
                <input type="text" />
                <button onClick={e => joinRoom(e)}>
                    Join Room
                    </button>
                </Col>
                <Col>
                    Create Room
                </Col>
            </Row>
        </Container>
    )
}
