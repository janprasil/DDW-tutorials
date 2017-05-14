import { Map, Record } from 'immutable';
import { referrers, mainConversions, microConversions } from './data';

const types = {
  'In general': 1,
  'Hiking': 2,
  'VHT': 3,
  'climbing school': 4,
  'Tourism': 5,
  'Lipari': 6,
  'Tours with accommodation': 7,
  'Neni': 8,
  'Montenegro': 9,
  'cyclo': 10,
  'Holiday Shipping': 11,
  'challenging expedition': 12,
  'Alps': 13,
  'exotica': 14,
  'Lastminute': 15,
  'Tours with lightweight tourism': 16,
  'Bulgaria': 17,
  'Ski': 18,
  'Corsica': 19,
  'Tourist': 20,
  'Stays with trips': 21,
  'rafting': 22,
  'hotelbuses': 23,
  'Water': 24,
  'Golf': 25,
  'undetected': 26,
  'School tours': 27,
}

const testIsMainConversion = (data) => {
  return new RegExp(mainConversions.join("|")).test(data.PageName)
  ||
  new RegExp(mainConversions.join("|")).test(data.CatName)
  ||
  new RegExp(mainConversions.join("|")).test(data.ExtCatName);
}

const testIsMicroConversion = (data) =>
  new RegExp(microConversions.join("|")).test(data.PageName);

export default class Visit extends Record({
  day: '',
  hour: 0,
  spentTime: '',
  pageNum: '',
  referrer: '',
  visitId: '',
  isMainConversion: false,
  isMicroConversion: false,
  pages: [],
  score: 0,
  upm: Map()
}, 'visit') {
  constructor(data) {
    const d = {
      visitId: data.VisitID,
      score: parseInt(data.PageScore),
      pages: [ data ],
      isMainConversion: testIsMainConversion(data),
      isMicroConversion: testIsMicroConversion(data),
    };

    super(d);
  }

  addPage(data) {
    return this
      .set('score', this.score + parseInt(data.PageScore))
      .set('pages', this.pages.concat(data))
      .set('isMainConversion', this.isMainConversion ? true : testIsMainConversion(data))
      .set('isMicroConversion', this.isMicroConversion ? true : testIsMicroConversion(data))
  }

  addVisitor(data) {
    return this
      .set('day', data.Day)
      .set('referrer', referrers.get(data.Referrer))
      .set('hour', parseInt(data.Hour, 10))
      .set('pageNum', data.Length_pagecount)
      .set('spentTime', data.Length_seconds);
  }

  computeUPM() {
    const newUpm = this.pages.reduce((prev, x) => {
      if (prev.get(x.TopicName)) {
        return prev.update(x.TopicName, p => p.TimeOnPage + parseInt(x.TimeOnPage, 10))
      } else {
        return prev.set(x.TopicName, parseInt(x.TimeOnPage, 10));
      }
    }, this.get('upm'));
    return newUpm;
  }

  // For crawler and spiders recognitions
  canBeRemoved() {
    if (this.hour > 0
      && this.hour < 6
      && this.pageNum < 3
      && this.spentTime < 3) {
        return true;
    }
    return false;
  }

  toCsvOutput() {
    return {
      day: this.day,
      hour: getHourString(this.hour),
      referrer: this.referrer,
      isMainConversion: this.isMainConversion,
      isMicroConversion: this.isMicroConversion,
      spentTime: spentTimeString(this.spentTime),
      pageNum: pageNumString(this.pageNum),
      score: this.score,
      visitId: this.visitId,
    };
  }

  toCsvTopics(count, min) {
    const res = {};
    if (this.pages.length < min) return null;
    for (let i = 0; i < count; i += 1) {
      res[`topic${i}`] = this.pages[i] ? this.pages[i].TopicName : null;
    }
    return res;
  }

  toCsvCluster(columns) {
    const upm = this.computeUPM().toJS();

    return columns.reduce((prev, cur) => {
      prev[types[cur]] = upm[cur] || '0';
      return prev;
    }, {});
  }
}

const getHourString = (hour) => {
  if (hour >= 0 && hour <= 8) {
    return 'rano'
  } else if (hour >= 8 && hour <= 12) {
    return 'poledne'
  } else if (hour >= 12 && hour <= 17) {
    return 'odpoledne'
  } else if (hour >= 17 && hour <= 20) {
    return 'podvecer'
  } else {
    return 'vecer'
  }
}

const spentTimeString = (time) => {
  if (time < 100) {
    return 'kratkaDoba'
  } else if (time < 300) {
    return 'stredniDoba'
  } else if (time < 600) {
    return 'delsiDoba'
  } else {
    return 'dlouhaDoba'
  }
}

const pageNumString = (pageNum) => {
  if (pageNum < 2) {
    return 'jedna'
  } else if (pageNum < 4) {
    return 'malo'
  } else if (pageNum < 10) {
    return 'vice'
  } else {
    return 'hodne'
  }
}
