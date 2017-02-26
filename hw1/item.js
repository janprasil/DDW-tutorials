import { getDateFromString, getValueOrEmptyString } from '../helpers';
import { Record } from 'immutable';

export default class Item extends Record({
  id: '',
  images: [],
  title: '',
  descriptionHtml: '',
  descirptionText: '',
  date: '',
  contact: {
    name: '',
    phone: '',
    locality: '',
    googleMaps: '',
  },
  price: '',
  url: '',
  categories: '',
}, 'item') {
  constructor($, uri) {
    const contact = getValueOrEmptyString(() => $('td.listadvlevo tr').children('td').eq(1).children());
    const locality = getValueOrEmptyString(() => $('td.listadvlevo tr').children('td').eq(4));
    const breadcrumbs = getValueOrEmptyString(() => $('div.drobky').children('a').toArray().map(x => x.children[0].data));
    const item = {
      images: getValueOrEmptyString(() => $('img.obrazekv').toArray().map(x => x.attribs.src)),
      title: getValueOrEmptyString(() => $('h1.nadpis').text().trim()),
      descriptionHtml: getValueOrEmptyString(() => $('div.popis').html().trim()),
      descirptionText: getValueOrEmptyString(() => $('div.popis').text().trim()),
      date: getValueOrEmptyString(() => $('span.velikost10').text().trim().replace(/^[^[]*\[([^\]]*)\].*$/, (match, p1) => getDateFromString(p1))),
      contact: {
        name: getValueOrEmptyString(() => contact.eq(0).text().trim()),
        phone: getValueOrEmptyString(() => contact.eq(3).text().trim()),
        locality: getValueOrEmptyString(() => locality.text().trim()),
        googleMaps: getValueOrEmptyString(() => locality.children()[0].attribs.href),
      },
      price: getValueOrEmptyString(() => $('td.listadvlevo tr').children('td').eq(6).text().trim()),
      url: uri.currentPath,
      categories: breadcrumbs,
      id: uri.currentPath.split('/')[4],
    };
    super(item);
  }
}
