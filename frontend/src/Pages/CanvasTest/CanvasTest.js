import React, { useState, useRef, useEffect, useContext } from 'react'
import { Col, Row, Container } from 'react-bootstrap'

//import Canvas Component
import Canvas from '../../Components/Canvas/Canvas'

export default function CanvasTest() {

    return (
        <Container>
            <Row style={{height: 100}}>

            </Row>
            <Row>
                <Canvas/>
            </Row>
        </Container>

    )
}