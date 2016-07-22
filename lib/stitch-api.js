import request from 'request';
import config from './config';

const baseUrl = config.stitch_api.url;
const allCountriesUrl = baseUrl + 'countries';

export function getAllCountries(cb) {
  request.get({url: allCountriesUrl}, (err, resp, body) => {
    if (err) {
      cb(err);
    } else {
      cb(null, JSON.parse(body));
    }
  });
}

export function getCountryNameByCode(countryCode, cb) {
  let nameUrl = baseUrl + countryCode + '/name';
  request.get({url: nameUrl}, (err, resp, body) => {
    if (err) {
      cb(err);
    } else {
      cb(null, body.trim());
    }
  });
}

