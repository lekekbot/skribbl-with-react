import React, {useContext, useEffect, useState} from 'react'
import { Col, Row, Container }from 'react-bootstrap'
import Swal from 'sweetalert2'
import io from "socket.io-client";
import { useHistory } from 'react-router-dom'

//styles


//components
import { MainContext } from '../../Context/mainContext';
import { UsersContext } from '../../Context/usersContext';

//backend
const socket = io('http://localhost:8000');

export default function WaitingRoom() {
    const history = useHistory()
    const {users, setUsers} = useContext(UsersContext)
    const {name, setName, room, setRoom} = useContext(MainContext)
    const [html, setHTML] = useState([])

    //useeffect to get users, on etc. etc.
    return (
        <Container>
            <div>{room}</div>
            {users.length > 0 ?
                users.map((e,i) => (
                    <Row key={i}>{e.name}</Row>
                ))    
            : ''}
        </Container>
    )
}
