import {Route, BrowserRouter as Router, Switch, Redirect} from 'react-router-dom';
import { MainProvider } from './Context/mainContext';
import { UsersProvider } from './Context/usersContext';

//pages
import Home from './Pages/Home/Home'
import Room from './Pages/Room/Room';
import WaitingRoom from './Pages/WaitingRoom/WaitingRoom'

const Routes = props => {
  return (
    <MainProvider>
      <UsersProvider>
        <Router {...props}>
          <Switch>
            <Route exact path="/home">
              <Home/>  
            </Route>

            <Route path="/room">
              <Room/>
            </Route>


            <Route path="/waiting-room">
              <WaitingRoom/>
            </Route>

            <Route path="*">
              <Home />
            </Route>
            
          </Switch>
        </Router>
      </UsersProvider>
    </MainProvider>
  )
}

export default Routes