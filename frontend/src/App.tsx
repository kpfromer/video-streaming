import React, { Component } from 'react';
import BasicPlayer from './BasicPlayer';
import BufferPlayer from './BufferPlayer';

class App extends Component {
  render() {
    return (
      <div className="App">
        {/* <BasicPlayer mediaUrl="http://localhost:3001/example.webm" /> */}
        <BufferPlayer videoUrl="http://localhost:3001/example.webm" clusterDataUrl="http://localhost:3001/example.json" />
      </div>
    );
  }
}

export default App;
