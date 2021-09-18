import {Route, BrowserRouter as Router, Switch, Redirect} from 'react-router-dom';
import { MainProvider } from './Context/mainContext';
import { UsersProvider } from './Context/usersContext';
import { SocketProvider } from './Context/socketContext';

//pages
import Home from './Pages/Home/Home'
import WaitingRoom from './Pages/WaitingRoom/WaitingRoom'
import CanvasTest from './Pages/CanvasTest/CanvasTest'
import Game from './Pages/Game/Game';

const Routes = props => {
  return (
    <MainProvider>
      <UsersProvider>
        <SocketProvider>
          <Router {...props}>
            <Switch>
              <Route exact path="/home">
                <Home/>  
              </Route>

              <Route path="/room">
                <WaitingRoom/>
              </Route>

              <Route path="/CanvasTest">
                <CanvasTest/>
              </Route>

              <Route path="/game">
                <Game/>
              </Route>

              <Route path="*">
                <Home />
              </Route>
              
            </Switch>
          </Router>
        </SocketProvider>
      </UsersProvider>
    </MainProvider>
  )
}

export default Routes