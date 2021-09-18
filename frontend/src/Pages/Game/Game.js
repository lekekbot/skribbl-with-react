import React, {useState, useContext, useRef, useEffect} from 'react'
import { Col, Row, Container } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

//style
import styles from './Game.module.css'

//components
import { MainContext } from '../../Context/mainContext';
import { UsersContext } from '../../Context/usersContext';
import { SocketContext } from '../../Context/socketContext';
import Toast from '../../Shared/swal'

export default function Game() {
    const history = useHistory()
    const {name, setName, room, setRoom} = useContext(MainContext)
    const {setUsers} = useContext(UsersContext)
    const socket = useContext(SocketContext)
    const [messages, setMessages] = useState([])

    const [timer, setTimer] = useState()
    const [word, setWord] = useState()

    const msg = useRef(null)

    useEffect(() => {
        socket.on('client-send-message', (data) => {
            setMessages(prevState => [...prevState, {name: data.name, message: data.message}])
        })   
    }, [socket])

    const sendMessage =  e => {
        if(e.key !== 'Enter') return
        if(msg.current.value.length > 0) {
            //socket emit enter
            socket.emit('send-message', {
                message: msg.current.value,
                username: name,
                room: room
            })
            //set state for messages    
            msg.current.value = ''
        }
    }

    const chatMessages = messages.map((e,i) => (
        <li key={i} className={styles.message}>
            <p><b>{e.name}</b>: {e.message}</p>
        </li>
    ))

    return (
        <Container className={styles.box}>
            <Row>
                <Col xs={2}>
                    <h1>Score</h1>
                    <div>
                        {/* scorboard, map it */}
                    </div>
                </Col>
                <Col xs={8}>
                    {/* word thing */}
                    <div className={styles.top}>
                        {/* timer */}
                        <div>{timer}</div>

                        {/* word */}
                        <div>{word}</div>
                    </div>
                    {/* /canvas */}
                    NYESS
                </Col>
                <Col xs={2}>
                    {/* chat box */}
                    <h1>Chat</h1>
                    <div>
                        {/* messages */}
                        <ul className={styles.chatMessages}>{chatMessages}</ul>
                        
                        <input type="text" ref={msg} onKeyDown={e => sendMessage(e)}/>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}
