import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { GetIDPage } from './components/GetIDPage.jsx';
import { HomePage } from './components/HomePage.jsx';
import { Documentation } from './components/Documentation.jsx';
import { HAPI } from './components/HAPI.jsx';
import { Semantic } from './components/Semantic.jsx';
import { BMJ } from './components/BMJ.jsx';
import Nav from 'react-bootstrap/Nav';


export const App = class App extends React.Component {
  
  
  render() {

    return (
      <div className="App">

        <Router>
          <div>
            {/* Set defaultActiveKey to the current 'rest' path in order to
              switch the Nav tab to the current selected page */}
            <Nav variant="tabs" defaultActiveKey={window.location.pathname}>
                <Nav.Link href="/">Home</Nav.Link>
              
                <Nav.Link href="/getid">Get ID</Nav.Link>
             
                <Nav.Link href="/documentation">Documentation</Nav.Link>
            
                <Nav.Link href="/hapi">HAPI</Nav.Link>

                <Nav.Link href="/semantic">Semantic</Nav.Link>

                <Nav.Link href="/bmj">BMJ</Nav.Link>

            </Nav>

            <Switch>
                <Route exact path="/" >
                  <HomePage/>
                </Route>

                <Route path="/getid" component={GetIDPage}>
                  <GetIDPage />
                </Route>

                <Route path="/documentation" component={Documentation}>
                  <Documentation />
                </Route>

                <Route path="/hapi" component={HAPI}>
                  <HAPI />
                </Route>

                <Route path="/semantic" component={Semantic}>
                  <Semantic />
                </Route>

                <Route path="/bmj" component={BMJ}>
                  <BMJ />
                </Route>

            </Switch>

          </div>
        </Router>
      </div>
    )
  }
}

export default App;