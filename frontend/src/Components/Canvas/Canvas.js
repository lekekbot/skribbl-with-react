import React, { useState, useRef, useEffect, useContext } from 'react'
import { Col, Row, Container } from 'react-bootstrap'

//styles
import styles from './Canvas.module.css'

export default function Canvas(props) {

    const canvasRef = useRef(null)

    useEffect(() => {

        //canvas settings
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.height = 500;
        canvas.width = 1000;

        //canvas functions
        let drawing = false;

        function startPosition(e) {
            drawing = true;
            draw(e);
        }

        function endPosition() {
            drawing = false;
            ctx.beginPath();
        }

        function draw(e) {
            if (!drawing) return;
            ctx.lineWidth = 10;
            ctx.lineCap = "round";

            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
            
        }

        //my cool event listeners
        canvas.addEventListener("mousedown", startPosition);
        canvas.addEventListener("mouseup", endPosition);
        canvas.addEventListener("mousemove", draw);

    }, [])

    return (
        <Row className={styles.canvasBox}>
            <canvas className={styles.canvas} ref={canvasRef} {...props} />
            {/*Ill add options for the canvas brush some other time*/}
        </Row>
    )

}
