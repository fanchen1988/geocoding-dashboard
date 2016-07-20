import {waterfall, map} from 'async';
import {pickBy, mapKeys, reduce, merge} from 'lodash';
import mongoServer from './mongo';

const dbName = 'geocoding';
const colName = 'geosummarizer_eval';
const countryPipeline = [
  {
    $group: {
      _id: '$country'
    }
  },
  {
    $project: {
      _id: 0,
      countryCode: '$_id'
    }
  }
];

const queryOpt = {
  sort: [['_id', -1]]
};

const fieldNameMapping = {
  'country': 'Country',
  'tier': 'Tier',
  'version': 'Version',
  'delta.within_25m': 'Good Geosummarizer Rate',
  'delta.dqm': 'Geosummarizer Accuracy',
  'ideal.standard_diviation_distance': 'Ideal Input Standard Deviation',
  'ideal.within_50m': 'Ideal Input Rate',
  'ideal.dqm': 'Input Accuracy'
};

function filterResult(record, cb) {
  record = reduce(record, (r, v, k) => {
    if ('object' === typeof v) {
      v = mapKeys(v, (_v, kk) => { return `${k}.${kk}` });
      r = merge(r, v);
    } else {
      r[k] = v;
    }
    return r;
  }, {});
  record = pickBy(record, (_v, k) => {return fieldNameMapping[k];});
  cb(null, mapKeys(record, (_v, k) => { return fieldNameMapping[k] }));
}

function getLatestCountryRow(countryCode, cb) {
  mongoServer.findOne(dbName, colName, {country: countryCode}, queryOpt, cb);
}

function getDataFromDb(cb) {
  waterfall([
    getExistingCountryCodes,

    (countryCodes, callback) => {
      map(countryCodes, getLatestCountryRow, callback);
    },

    (records, callback) => {
      map(records, filterResult, callback);
    }
  ], cb);

}

function getExistingCountryCodes(cb) {
  mongoServer.aggregate(dbName, colName, countryPipeline, (err, result) => {
    if (err) {
      cb(err);
    } else {
      let countryCodes = result.map((item) => {return item.countryCode});
      cb(null, countryCodes);
    }
  });
}

export function getGeosummarizerData(cb) {
  getDataFromDb(cb);
}
