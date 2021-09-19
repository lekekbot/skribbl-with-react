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

    //brush settings
    let brushSize = 10;
    let brushColor = "black";

    function handleBrushSize(size) {
        brushSize = size;
    }
    function handleBrushColor(color) {
        brushColor = color;
    }

    function handleCanvasClear() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    //canvas settings
    useEffect(() => {

        let sendingDraw = false

        socket.on('drawing', (data) => {
            console.log(data)
            sendDraw(data.x, data.y)
        })

        socket.on('mouseUp', () => {
            drawing = false;
            ctx.beginPath();
        })

        function sendDraw(x, y) {
            sendingDraw = true
            draw(x, y)
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = canvasRef.clientWidth || 1000
        canvas.height = canvasRef.clientHeight - 200 || 500

        //canvas functions
        let drawing = false;

        function startPosition(e) {
            drawing = true;
            draw(e.offsetX, e.offsetY);
        }

        function endPosition() {
            drawing = false;
            ctx.beginPath();
            socket.emit('mouse-up', {
                room: room
            })
        }

        function draw(x, y) {
            if (!drawing && !sendingDraw) return
            ctx.lineWidth = brushSize;
            ctx.lineCap = "round";
            ctx.strokeStyle = brushColor;


            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);

            if (drawing) {
                socket.emit('send-drawing', {
                    x: x,
                    y: y,
                    room: room
                })
            } else if (sendingDraw) {
                sendingDraw = false
            }
        }

        //my cool event listeners
        canvas.addEventListener("mousedown", startPosition);
        canvas.addEventListener("mouseup", endPosition);
        canvas.addEventListener("mousemove", e => {
            draw(e.offsetX, e.offsetY)
        });

    }, [])

    return (
        <Container className={styles.canvasBox}>
            <Row>
                <Col>
                    <canvas className={styles.canvas} ref={canvasRef} {...props} />
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Button onClick={() => handleBrushSize(25)} className={styles.button}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brush-fill" viewBox="0 0 16 16"><path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132 3.659 3.659 0 0 1-.562-.135 1.382 1.382 0 0 1-.466-.247.714.714 0 0 1-.204-.288.622.622 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896.126.007.243.025.348.048.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04z" /></svg>
                    </Button>
                    <Button onClick={() => handleBrushSize(10)} className={styles.button}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen-fill" viewBox="0 0 16 16"><path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001z" /></svg>
                    </Button>
                    <Button onClick={() => handleBrushSize(5)} className={styles.button}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" /></svg>
                    </Button>
                    <Button onClick={() => handleBrushColor("white")} className={styles.button}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eraser-fill" viewBox="0 0 16 16"><path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z" /></svg>
                    </Button>
                    <Button onClick={() => handleCanvasClear()} className={styles.button}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" /></svg>
                    </Button>
                </Col>
                <Col md={6}>
                    <Row>
                        <Button onClick={() => handleBrushColor("red")} className={styles.button} style={{ background: "red", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => handleBrushColor("orange")} className={styles.button} style={{ background: "orange", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => handleBrushColor("yellow")} className={styles.button} style={{ background: "yellow", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => handleBrushColor("lime")} className={styles.button} style={{ background: "lime", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => handleBrushColor("green")} className={styles.button} style={{ background: "green", border: "none", height: "2rem", width: "2rem" }} ></Button>
                    </Row>
                    <Row>
                        <Button onClick={() => handleBrushColor("blue")} className={styles.button} style={{ background: "blue", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => handleBrushColor("pink")} className={styles.button} style={{ background: "pink", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => handleBrushColor("purple")} className={styles.button} style={{ background: "purple", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => handleBrushColor("brown")} className={styles.button} style={{ background: "brown", border: "none", height: "2rem", width: "2rem" }} ></Button>
                        <Button onClick={() => handleBrushColor("black")} className={styles.button} style={{ background: "black", border: "none", height: "2rem", width: "2rem" }} ></Button>
                    </Row>

                </Col>
            </Row>
        </Container>
    )
}
