import React, { useState, useContext, useRef, useEffect } from 'react'
import { Col, Row, Container, ProgressBar } from 'react-bootstrap'
import { withRouter } from 'react-router';

//style
import styles from './Game.module.css'

//components
import { MainContext } from '../../Context/mainContext';
import { UsersContext } from '../../Context/usersContext';
import { SocketContext } from '../../Context/socketContext';
import Canvas from '../../Components/Canvas/Canvas';

const Game = withRouter(({ history }) => {
    const [host] = useState(history.location.state.host)
    const { name, setName, room, setRoom } = useContext(MainContext)
    const { users, setUsers } = useContext(UsersContext)
    const socket = useContext(SocketContext)
    const [messages, setMessages] = useState([])

    const [timer, setTimer] = useState()
    const [word, setWord] = useState()
    const [wordSelection, setwordSelection] = useState([])
    const msg = useRef(null)
    const [msgDisable, setmsgDisable] = useState(false)
    const [showWord, setshowWord] = useState('')
    const [drawer, setdrawer] = useState('')

    useEffect(() => {
        let draw = ''
        socket.on('client-send-message', (data) => {
            setMessages(prevState => [...prevState, { name: data.name, message: data.message }])
        })

        socket.on('client-correct', (data) => {
            setMessages(prevState => [...prevState, { message: data.message }])
        })

        socket.on('disable-user-message', () => {
            setmsgDisable(true)
        })

        socket.on('clear-chat', () => {
            setMessages([])
        })

        socket.on('client-game-setup', (data) => {
            setwordSelection([])
            setmsgDisable(false)
            setTimer(100)
            setdrawer(data.drawer)
            draw = data.drawer
            if (socket.id == data.drawer) {
                setwordSelection(data.words[0])
                setmsgDisable(true)
            }
        })

        socket.on('time', (data) => {
            setWord(data.word)
            setTimer(data.time)
        })

        socket.on('round-over', (data) => {
            setshowWord(`The word is: ${data.word}`)
            setTimeout(() => {
                setshowWord('')
                if (socket.id == draw) {
                    socket.emit('next-round', {
                        room: room
                    })
                }
            }, 2000);
        })

        socket.on('end-game', () => {
            console.log('game ended bitch')
            
        })

    }, [socket])

    useEffect(() => {
        if (room) {
            if (host) {
                socket.emit('game-setup', {
                    room: room
                })
            }
        } else {
            // dev will comment off
            // history.push('/')
        }
    }, [])

    const sendMessage = e => {
        if (e.key !== 'Enter') return
        if (msg.current.value.length > 0) {
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

    const selectedWord = word => {
        setwordSelection([])
        if (socket.id == drawer) {
            socket.emit('start-round', {
                room: room,
                word: word
            })
        }
    }

    const chatMessages = messages.map((e, i) => (
        <p className={styles.message} key={i}>{e.hasOwnProperty('name') ? <b>{`${e.name}: `}</b> : ''}{e.message}</p>
    ))

    const getScore = users.map((e, i) => (
        <li key={i} className={styles.score}>
            <div className={e.isDrawing ? styles.scoreRowDrawing : styles.scoreRow}>
                <div>{e.name}</div>
                <div>Score: {e.score}</div>
            </div>
        </li>
    ))

    const selectWord = wordSelection.map((e, i) => (
        <div className={styles.wordCol} key={i} onClick={() => selectedWord(e)}>
            {e}
        </div>
    ))

    return (
        <div className={styles.box}>
            <Container className={styles.gameBox}>
                <Row>
                    <Col xs={2}>
                        <h1 className={styles.scoreHeader}>Scores</h1>
                    </Col>
                    <Col xs={7}>
                        <div className={styles.top}>
                            <ProgressBar className={styles.word} animated now={timer} label={`${word}`} />
                        </div>
                    </Col>
                    <Col xs={3}>
                        <h1 className={styles.scoreHeader}>Chat</h1>
                    </Col>
                </Row>
                <Row>
                    <Col xs={2} style={{ maxHeight: '100%' }}>
                        <ul className={styles.scoreboard}>
                            {getScore}
                        </ul>
                    </Col>
                    <Col xs={7} style={{ padding: 0, margin: 0 }}>
                        {/* /canvas */}
                        <div className={styles.canvas}>
                            <Canvas />
                        </div>
                    </Col>
                    <Col xs={3} className={styles.chat}>
                        <div className={styles.chatMessages}>{chatMessages}</div>
                        <input className={styles.chatInput} type="text" ref={msg} onKeyDown={e => sendMessage(e)} disabled={msgDisable} />
                    </Col>
                </Row>
            </Container>
            {
                selectWord.length > 0 ?
                    <div className={`${styles.wordContainer} wordContainer`}>
                        <div className={styles.wordRow}>{selectWord}</div>
                    </div>
                    : ''
            }
            {
                showWord.length > 0 ?
                    <div className={`${styles.wordContainer} wordContainer`}>
                        <div className={styles.wordRow}>{showWord}</div>
                    </div>
                    : ''
            }
        </div>
    )
})

export default Game