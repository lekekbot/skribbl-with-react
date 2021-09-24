import React, { useState, useRef, useEffect, useContext } from 'react'
import { Col, Row, Container, Button } from 'react-bootstrap'

//styles
import styles from './Canvas.module.css'

//components
import { SocketContext } from '../../Context/socketContext';
import { MainContext } from '../../Context/mainContext';



export default function Canvas(props) {
    const socket = useContext(SocketContext)
    const { room } = useContext(MainContext)
    const canvasRef = useRef(null)
    const contextRef = useRef(null)
    const [color, setcolor] = useState('black')
    const [size, setsize] = useState(10)
    const [drawing, setdrawing] = useState(false)
    const [sendingDraw, setsendingDraw] = useState(false)
    const [drawer, setdrawer] = useState(false)
    const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
    useEffect(() => {
        const handleResize = () => {
            setWindowSize([window.innerWidth, window.innerHeight])
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const [windowW, windowH] = windowSize

    //brush settings
    // function handleBrushSize(size) {
    //     brushSize = size;
    // }
    // function handleBrushColor(color) {
    //     brushColor = color;
    //     console.log(brushColor)
    // }

    function handleCanvasClear() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        socket.emit('clear-drawing', {
            room: room
        })
    }

    function startPosition() {
        if (!drawer) {
            setdrawing(true)
        }
    }

    function endPosition() {
        setdrawing(false)
        contextRef.current.beginPath();
        socket.emit('mouse-up', {
            room: room
        })
    }

    function draw(x, y) {
        if (!drawing) return

        contextRef.current.lineWidth = size;
        contextRef.current.lineCap = "round";
        contextRef.current.strokeStyle = color;

        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);

        if (drawing) {
            socket.emit('send-drawing', {
                x: x,
                y: y,
                size: size,
                color: color,
                room: room,
            })
        }
    }

    const mouseDraw = ({ nativeEvent }) => {
        const { screenX, clientY, screenY, clientX } = nativeEvent
        let quack = document.getElementById('canvas').getBoundingClientRect();

        // let a = canvasRef.current.parentNode.parentNode.clientWidth
        // let b = windowW
        // let c = (b - a)/2
        let x = clientX - quack.left
        let y = clientY - quack.top

        draw(x , y)
    }

    function testing() {
        console.log(windowW)
    }

    //canvas settings
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = canvasRef.current.parentNode.parentNode.parentNode.clientHeight - 120
        canvas.height = canvasRef.current.parentNode.parentNode.parentNode.clientHeight - 120

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        contextRef.current = ctx
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current;

        socket.on('drawing', (data) => {
            contextRef.current.lineWidth = data.size;
            contextRef.current.lineCap = "round";
            contextRef.current.strokeStyle = data.color;

            contextRef.current.lineTo(data.x, data.y);
            contextRef.current.stroke();
            contextRef.current.beginPath();
            contextRef.current.moveTo(data.x, data.y);
        })

        socket.on('clear', (data) => {
            if(data.scale) {
                console.log('im here');
                contextRef.current.setTransform(1, 0, 0, 1, 0, 0);
            }
            contextRef.current.fillStyle = "white";
            contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
        })

        socket.on('mouseUp', () => {
            setdrawing(false)
            contextRef.current.beginPath();
        })

        socket.on('client-game-setup', (data) => {
            if (socket.id == data.drawer) {
                setdrawer(false)
                console.log('yes oks');
                contextRef.current.setTransform(1, 0, 0, 1, 0, 0);
                socket.emit('scale-setup', {
                    room: room,
                    width: document.getElementById('canvas').getAttribute('width'),
                    height: document.getElementById('canvas').getAttribute('height')
                })
            } else {
                setdrawer(true)
            }
        })

        socket.on('setup-scale', (data) => {
            console.log('proc');
            let width = (document.getElementById('canvas').getAttribute('width') / data.width) 
            let height = (document.getElementById('canvas').getAttribute('height') / data.height) 
            
            contextRef.current.scale(width, height)
        })
    }, [socket, canvasRef])

    return (
        <div className={styles.canvasBox}>
                <canvas
                    id="canvas"
                    className={styles.canvas}
                    ref={canvasRef}
                    {...props}
                    onMouseDown={startPosition}
                    onMouseUp={endPosition}
                    onMouseMove={mouseDraw}
                />
            <Row className={styles.canvasTools}>
                <Col md={6}>
                    <Button onClick={() => setsize(25)} className={styles.button}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132 3.659 3.659 0 0 1-.562-.135 1.382 1.382 0 0 1-.466-.247.714.714 0 0 1-.204-.288.622.622 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896.126.007.243.025.348.048.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04z" /></svg>
                    </Button>
                    <Button onClick={() => setsize(10)} className={styles.button}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001z" /></svg>
                    </Button>
                    <Button onClick={() => setsize(5)} className={styles.button}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" /></svg>
                    </Button>
                    <Button onClick={() => setcolor("white")} className={styles.button}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z" /></svg>
                    </Button>
                    <Button onClick={() => handleCanvasClear()} className={styles.button}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" /></svg>
                    </Button>
                    <Button onClick={() => testing()} className={styles.button}>
                        lief
                        
                        </Button>

                </Col>
                <Col md={6}>
                    <Row>
                        <Button onClick={() => setcolor("red")} className={styles.button} style={{ background: "red", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => setcolor("orange")} className={styles.button} style={{ background: "orange", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => setcolor("yellow")} className={styles.button} style={{ background: "yellow", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => setcolor("lime")} className={styles.button} style={{ background: "lime", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => setcolor("green")} className={styles.button} style={{ background: "green", border: "none", height: "2rem", width: "2rem" }} ></Button>
                    </Row>
                    <Row>
                        <Button onClick={() => setcolor("blue")} className={styles.button} style={{ background: "blue", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => setcolor("pink")} className={styles.button} style={{ background: "pink", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => setcolor("purple")} className={styles.button} style={{ background: "purple", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => setcolor("brown")} className={styles.button} style={{ background: "brown", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => setcolor("black")} className={styles.button} style={{ background: "black", border: "none", height: "2rem", width: "2rem" }} ></Button>
                    </Row>

                </Col>
            </Row>
        </div>
    )
}
