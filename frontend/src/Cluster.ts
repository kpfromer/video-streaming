export class Cluster {
  public requested = false;
  public queued = false;
  public buffered = false;
  public data: null | ArrayBuffer = null;

  constructor(
    private byteStart: number,
    private byteEnd: number,
    public isInitCluster: boolean,
    public timeStart = -1,
    private timeEnd = -1
  ) {}

  public async download(vidUrl: string, flush: any, callback: any) {
    debugger
    this.requested = true;
    return await this.getClusterData(vidUrl, 2, () => {
      flush();
      callback();
    })
  }

  private makeCacheBuster() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 10; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private async getClusterData(vidUrl: string, retryCount = 0, cb:any) { //TODO: fix callback type
    // return new Promise((resolve, reject) => {
      debugger
      if (retryCount) {
        vidUrl += `?cacheBuster=${this.makeCacheBuster()}`
      }
  
      const xhr = new XMLHttpRequest();
  
      xhr.open('GET', vidUrl, true);
      xhr.responseType = 'arraybuffer';
      xhr.timeout = 6000;
      xhr.setRequestHeader('Range', `bytes=${this.byteStart}-${this.byteEnd}`)
      xhr.send();
  
      xhr.onload = () => {
        console.log('loaded video');
        if (xhr.status !== 206) {
          console.error("media: Unexpected status code " + xhr.status);
          return false;
        }
        this.data = new Uint8Array(xhr.response);
        this.queued = true;
        console.log('done');
        cb();
        // return resolve('done');
      }
  
      xhr.ontimeout = () => {
        console.error('timeout');
        if (retryCount == 0) {
          console.error('given up')
          // return reject('Given up downloading')
        } else {
          this.getClusterData(vidUrl, --retryCount, cb);
          // return resolve(this.getClusterData(vidUrl, --retryCount));
        }
      }
    // })
  }
}