import React, { Component } from 'react';
import { Cluster } from './Cluster';
import { debug } from 'util';

export interface BufferPlayerProps {
  videoUrl: string,
  clusterDataUrl: string
}

export default class BufferPlayer extends Component<BufferPlayerProps> {

  videoElement: React.RefObject<HTMLVideoElement>;

  clusters: Cluster[] = [];
  sourceBuffer: SourceBuffer | null = null;
  mediaSource: MediaSource | null = null;
  finished = false;

  state = {
    url: '',
    timeupdate: () => {}
  }

  constructor(props: any) {
    super(props);
    this.videoElement = React.createRef();
}

  downloadClusterData = async (clusterDataUrl: string) =>
    fetch(clusterDataUrl)
      .then(res => res.json())
      .then(body => 
        this.createClusters(body)
      )

  createClusters(rslt: any) { //TODO: types
    console.log({rslt})
    this.clusters.push(new Cluster(
      rslt.init.offset,
      rslt.init.size - 1,
      true
    ))

    for (let i = 0; i < rslt.media.length; i++) { // TODO: convert to forEach
      this.clusters.push(new Cluster(
        rslt.media[i].offset,
        rslt.media[i].offset + rslt.media[i].size - 1,
        false,
        rslt.media[i].timecode,
        (i === rslt.media.length - 1) ? parseFloat(rslt.duration / 1000 as any) : rslt.media[i + 1].timecode //TODO: WORK ON
      ))
    }
    console.log(this.clusters)
  }

  createSourceBuffer() {
    if (!this.mediaSource) {
      throw new Error('There is no media source');
    }
    console.log({mediaSource: this.mediaSource})
    this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vp8,vorbis"') // TODO: extract out codec
    this.sourceBuffer.addEventListener('updateend', () => {
      console.log('done update')
      this.flushBufferQueue();
    });
    this.downloadInitCluster();
    // TODO: extract?
    const onTimeUpdate = () => {
      this.downloadUpcomingClusters();
    }
    this.setState({ timeupdate: onTimeUpdate })
  }

  flushBufferQueue = () => {
    if (!this.sourceBuffer) {
      throw new Error('There is no source buffer');
    }
    if (!!this.sourceBuffer && !this.sourceBuffer.updating) {
      const initCluster = this.clusters.find(cluster => cluster.isInitCluster);
      // TODO: Does it need to check/error if no initCluster?
      if(!initCluster){console.error('not init cluster')}
      if (!!initCluster && (initCluster.queued || initCluster.buffered)) {
        const bufferQueue = this.clusters.filter(cluster => cluster.queued && !cluster.isInitCluster);
        console.log({ bufferQueue })
        if (!initCluster.buffered) {
          bufferQueue.unshift(initCluster);
        }
        if (bufferQueue.length) {
          const concatData = this.concatClusterData(bufferQueue);
          bufferQueue.forEach(bufferedCluster => {
            bufferedCluster.queued = false;
            bufferedCluster.buffered = true;
          });
          this.sourceBuffer.appendBuffer(concatData);
        }
      }
    }
  }

  async downloadInitCluster() {
    const cluster = this.clusters.find(cluster => cluster.isInitCluster);
    console.log({cluster})
    if (!cluster) {
      return console.error('Is no init cluster')
    }
    debugger
    await cluster.download(this.props.videoUrl, this.flushBufferQueue, () => {});
    debugger;
    console.log('done downloading init buffer')
    this.downloadUpcomingClusters();
  }
  
  downloadUpcomingClusters() {
    console.log('downloadUpcomingClusters')
    const nextClusters = this.clusters.filter(
      cluster => !cluster.requested && cluster.timeStart <= (this.videoElement.current as HTMLVideoElement).currentTime + 5
    );

    console.log(nextClusters)

    if (nextClusters.length) {
      nextClusters.forEach(nextCluster => nextCluster.download(this.props.videoUrl, this.flushBufferQueue, () => {}));
    } else {
      if (this.clusters.filter(cluster => !cluster.requested).length === 0) {
        console.log('finished buffering whole video');
      } else {
        this.finished = true;
        console.log('finished buffering ahead')
      }
    }
  }

  concatClusterData(clusterList: Cluster[]) {
    console.log({clusterList});

    const bufferArrayList = clusterList.map(cluster => cluster.data);

    let arrLength = 0;
    bufferArrayList.forEach(bufferArray => arrLength += (bufferArray as ArrayBuffer).byteLength);
    const returnArray = new Uint8Array(arrLength);
    let lengthSoFar = 0;
    bufferArrayList.forEach(bufferArray => {
      returnArray.set(bufferArray as any, lengthSoFar);
      lengthSoFar += (bufferArray as ArrayBuffer).byteLength;
    })
    return returnArray;
  }

  componentDidMount() {
    this.downloadClusterData(this.props.clusterDataUrl)
      .then(() => {
        console.log('creaing media')
        this.mediaSource = new MediaSource();
        this.mediaSource.addEventListener('sourceopen', () => {
          console.log('creating source buffer');
          this.createSourceBuffer();
        })
        this.setState({ url: URL.createObjectURL(this.mediaSource )})
      });
  }

  render() {
    return (
      <video  autoPlay controls src={this.state.url} ref={this.videoElement} onTimeUpdate={this.state.timeupdate} />
    );
  }
}