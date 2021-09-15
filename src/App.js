import React from 'react';
import { Helsebiblioteket } from './components/Helsebiblioteket.jsx';


export const App = class App extends React.Component { 
  
  render() {

    return (
      <div className="App">
        <Helsebiblioteket />
      </div>
    )
  }
}

export default App;