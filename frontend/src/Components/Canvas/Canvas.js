import React, { useState, useRef, useEffect, useContext } from 'react'
import { Col, Row, Container } from 'react-bootstrap'

//styles
import styles from './Canvas.module.css'

//components
import { SocketContext } from '../../Context/socketContext';
import { MainContext } from '../../Context/mainContext';

export default function Canvas(props) {
    const socket = useContext(SocketContext)
    const {room} = useContext(MainContext)

    const canvasRef = useRef(null)

    useEffect(() => {
        let sendingDraw = false

        socket.on('drawing', (data)=> {
            console.log(data)
            sendDraw(data.x, data.y)
        })

        socket.on('mouseUp', () => {
            drawing = false;
            ctx.beginPath();
        })

        function sendDraw(x,y) {
            sendingDraw = true
            draw(x,y)
        }

        //canvas settings
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = canvasRef.current.parentNode.parentNode.clientWidth && 1000
        canvas.height = canvasRef.current.parentNode.parentNode.parentNode.parentNode.clientHeight - 200 && 500

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
            ctx.lineWidth = 10;
            ctx.lineCap = "round";

            ctx.lineTo(x,y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x,y);
            
            if(drawing) {
                socket.emit('send-drawing', {
                    x: x,
                    y: y,
                    room: room
                })
            } else if(sendingDraw) {
                sendingDraw = false
            }
        }

        //my cool event listeners
        canvas.addEventListener("mousedown", startPosition);
        canvas.addEventListener("mouseup", endPosition);
        canvas.addEventListener("mousemove", e => {
            draw(e.offsetX,e.offsetY)
        });

    }, [])

    return (
        <div className={styles.canvasBox}>
            <canvas className={styles.canvas} ref={canvasRef} {...props} />
            {/*Ill add options for the canvas brush some other time*/}
        </div>
    )
}
