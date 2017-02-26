import C from 'crawler';
import Uri from './uri';
import robots from 'robots';

const robotsParser = new robots.RobotsParser();

export default class Crawler {
  constructor({ maxConnections, rateLimit, skipDuplicates, userAgent }) {
    this._crawler = new C({
      maxConnections,
      userAgent,
      rateLimit,
      skipDuplicates,
    });
  }

  _htmlCallback(cb) {
    return (error, res, done) => {
      if(error){
          console.log('FETCH HTML ERROR', error);
      } else {
          var $ = res.$;
          cb($, new Uri(res));
      }
      done();
    };
  }

  _textCallback(cb) {
    return (error, res, done) => {
      if(error){
          console.log('FETCH TEXT ERROR', error);
      } else {
          cb(res.body);
      }
      done();
    };
  }

  getHTML(uri, cb) {
    if (this._parser) {
      const access = this._parser.canFetchSync('*', uri);
      if (access) {
        this._crawler.queue([{ uri, callback: this._htmlCallback(cb) }]);
      } else {
        console.log('NO ACCESS BY ROBOTS');
      }
    } else {
      this._crawler.queue([{ uri, callback: this._htmlCallback(cb) }]);
      console.log('NO ROBOTS, FETCHING ALL');
    }
  };

  getRobots(uri, cb) {
    robotsParser.setUrl(`${uri}/robots.txt`, (parser, success) => {
      if (success) {
        this._parser = parser;
      }
      cb();
    });
  };

  onDrain(cb) {
    this._crawler.on('drain', () => {
      cb();
    });
  };
}
