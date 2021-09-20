import React, {useState, useContext, useRef, useEffect} from 'react'
import { Col, Row, Container } from 'react-bootstrap'
import { useHistory, withRouter } from 'react-router';

//style
import styles from './Game.module.css'

//components
import { MainContext } from '../../Context/mainContext';
import { UsersContext } from '../../Context/usersContext';
import { SocketContext } from '../../Context/socketContext';
import Toast from '../../Shared/swal'
import Canvas from '../../Components/Canvas/Canvas';

const Game = withRouter(({history}) => {
    const [host] = useState(history.location.state.host)
    const {name, setName, room, setRoom} = useContext(MainContext)
    const {users, setUsers} = useContext(UsersContext)
    const socket = useContext(SocketContext)
    const [messages, setMessages] = useState([])

    const [timer, setTimer] = useState()
    const [word, setWord] = useState()
    const [disableEdit, setDisableEdit] = useState(false)

    const msg = useRef(null)

    
    useEffect(() => {
        socket.on('client-send-message', (data) => {
            setMessages(prevState => [...prevState, {name: data.name, message: data.message}])
        })   

        socket.on('client-game-setup', (data) => {
            console.log(data)
            if(socket.id == data.drawer) {
                setDisableEdit(false)
            } else {
                setDisableEdit(true)
            }
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
        <p className={styles.message} key={i}><b>{e.name}</b>: {e.message}</p>
    ))

    const getScore = users.map((e,i)=> (
        <li key={i} className={styles.score}>
            <div className={styles.scoreRow}><b>{e.name}</b>
            {e.isDrawing ? <>NYESS</> : ''}
            <span className={styles.scoreScore}>{e.score}</span></div>
        </li>
    ))

    return (
        <Container className={styles.box}>
            <Row style={{maxHeight: '100vh'}}>
                <Col xs={2} style={{maxHeight: '100%'}}>
                    <h1>Score</h1>
                    <ul className={styles.chatMessages}>
                        {/* scorboard, map it */}
                        {getScore}
                    </ul>
                </Col>
                <Col xs={8} style={{display: 'flex', maxHeight: '100%', flexDirection:'column'}}>
                    {/* word thing */}
                    <div className={styles.top}>
                        {/* timer */}
                        <div>{timer}</div>

                        {/* word */}
                        <div>{word}</div>
                    </div>
                    {/* /canvas */}
                    NYESS
                    <div className={styles.canvas}>
                        <Canvas />
                    </div>
                </Col>
                <Col xs={2} className={styles.chat} style={{maxHeight: '100%'}}>
                    {/* chat box */}
                    <h1>Chat</h1>
                    
                    {/* messages */}
                    <div className={styles.chatMessages}>{chatMessages}</div>
                        
                    <input type="text" ref={msg} onKeyDown={e => sendMessage(e)}/>
                </Col>
            </Row>
        </Container>
    )
})

export default Game