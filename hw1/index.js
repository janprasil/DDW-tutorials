import Crawler from '../helpers/crawler';
import Item from './item';
import OutputStream from '../helpers/file';
import { database } from '../helpers/firebase';
import { getDateFromString, getValueOrEmptyString } from '../helpers';
import { maxConnections, outputName, rateLimit, skipDuplicates, userAgent, uri } from './config';

// const file = new OutputStream(outputName);
const crawler = new Crawler({ maxConnections, rateLimit, skipDuplicates, userAgent });

const itemCallback = ($, uri) => {
  try {
    const item = new Item($, uri);
    database.ref(`bazos/${item.get('id')}`).set(item.toJS());
    // file.write(item);
  } catch (e) {
    console.log('ERROR FETCHING ITEM', e);
  }
};

const listCallback = ($, uri) => {
  const items = $('span.vypis table.inzeraty tr:nth-of-type(1)').toArray();

  let stopDownload = false;
  items.forEach(x => {
    if (stopDownload) return;
    const date =
      getValueOrEmptyString(() => x.children[0].children[2].children[2].data.replace(/^[^[]*\[([^\]]*)\].*$/, (match, p1) => getDateFromString(p1)))
      ||
      getValueOrEmptyString(() => x.children[0].children[1].data.replace(/^[^[]*\[([^\]]*)\].*$/, (match, p1) => getDateFromString(p1)));

    const d = new Date();
    d.setDate(d.getDate() - 31);

    if (!date || date < d) {
      stopDownload = true;
      return;
    }

    // console.log('list');
    const href = getValueOrEmptyString(() => x.children[0].children[1].children[0].attribs.href);
    if (!href) {
      console.log('ERROR IN LIST', x.children[0].children[1].children[0]);
    } else {
      crawler.getHTML(uri.appendPath(href), itemCallback)
    }
  });

  if (stopDownload) return;

  const nextPageAnchor = $('p.strankovani a').last()['0'];
  if (nextPageAnchor) {
    crawler.getHTML(nextPageAnchor.attribs.href, listCallback);
  }
};

const mainCategoryCallback = ($, uri) => {
  const subcategories = $('td.listal div.barvaleva a').toArray();
  subcategories.forEach(x => {
    // const x = subcategories[0];
    let url = uri.appendPath(x.attribs.href);
    crawler.getHTML(url, listCallback);
  });
};

const mainCallback = ($) => {
  const categories = $('td.listahl span.nadpisnahlavni a').toArray();
  categories.forEach(x => {
    // const x = categories[0];
    crawler.getHTML(x.attribs.href, mainCategoryCallback)
  });
};

const robotsCallback = () => {
  crawler.getHTML(uri, mainCallback);
};

crawler.getRobots(uri, robotsCallback);
crawler.onDrain(() => {
  // file.end();
  console.log('ENDING');
  process.exit();
});

