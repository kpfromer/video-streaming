import React, { Component } from 'react';
import BasicPlayer from './BasicPlayer';

class App extends Component {
  log = ({ message, error }) => {
    if (error) {
      return console.error(message);
    }
    return console.log(message);
  }
  render() {
    return (
      <div className="App">
        <BasicPlayer onLog={this.log} />
      </div>
    );
  }
}

export default App;
