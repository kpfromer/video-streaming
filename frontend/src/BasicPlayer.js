import React, { Component } from 'react';
import PropTypes from 'prop-types'

export default class BasicPlayer extends Component {

  static propTypes = {
    onLog: PropTypes.func
  }

  static defaultProps = {
    onLog: ({ message, error }) => {}
  }

  state = { url: '' }

  createSourceBuffer(mediaSource) {
    const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8,vorbis"'); // TODO: MIME TYPE
    sourceBuffer.addEventListener('updateend', () => {
      this.props.onLog({ message: 'Ready', error: false });
      mediaSource.endOfStream();
    });
    this.props.onLog({ message: 'Downloading video data', error: false });
    fetch('http://localhost:3001/example.webm')
      .then(res => res.arrayBuffer())
      .then(videoData => {
        if (!sourceBuffer.updating) {
          this.props.onLog({ message: 'Appending video data to buffer', error: false });
          return sourceBuffer.appendBuffer(videoData);
        } else {
          return this.props.onLog({ message: 'Source Buffer failed to update', error: true });
        }
      })
      .catch(error => {
        this.props.onLog({ message: `Error encountered with fetch: ${error}`, error: true });
      })
  }

  componentDidMount() {
    if (!window.MediaSource || !MediaSource.isTypeSupported('video/webm; codecs="vp8,vorbis"')) {
      this.props.onLog({ message: 'Your browser is not supported', error: true });
      return;
    }
    
    this.props.onLog({ message: 'Creating media source', error: false });

    const mediaSource = new MediaSource();
    const url = URL.createObjectURL(mediaSource);    

    mediaSource.addEventListener('sourceopen', () => {
      this.props.onLog({ message: 'Creating source buffer', error: false });
      this.createSourceBuffer(mediaSource);
    });

    this.setState({ url });
  }

  render() {
    return (
      <video autoPlay controls src={this.state.url} />
    )
  }
}
