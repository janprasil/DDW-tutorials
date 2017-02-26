
export default class Uri {
  constructor(res) {
    this.protocol = res.request.uri.protocol;
    this.hostname = res.request.uri.hostname;
    this.currentPath = res.request.uri.href;
  }

  appendPath(url) {
    if (url.startsWith('http')) {
      return url;
    } else if (url.startsWith('/')) {
      return `${this.protocol}//${this.hostname}${url}`;
    } else {
      return `${this.currentPath}${this.currentPath.endsWith('/') ? '' : '/'}${url}`;
    }
  }
}
