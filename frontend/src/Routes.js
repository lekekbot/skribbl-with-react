import logo from './logo.svg';
import './App.css';

//pages
import Home from './Pages/Home/Home'
import Room from './Pages/Room/Room';
import {Route, BrowserRouter as Router, Switch, Redirect} from 'react-router-dom';

const Routes = props => {
  return (
    <Router {...props}>
      <Switch>
        <Route exact path="/home">
          <Home/>  
        </Route>

        <Route path="/room">
          <Room/>
        </Route>

        <Route path="*">
          <Home />
        </Route>

      </Switch>
    </Router>
  )
}

export default Routes