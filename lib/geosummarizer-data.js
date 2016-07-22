import {waterfall, map} from 'async';
import {find, pickBy, mapKeys, reduce, merge} from 'lodash';
import {getAllCountries} from './stitch-api';
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
  'countryCode': 'countryCode',
  'countryName': 'countryName',
  'tier': 'tier',
  'version': 'version',
  'delta.within_25m': 'geosumRate',
  'delta.dqm': 'geosumAccuracy',
  'ideal.standard_diviation_distance': 'inputSD',
  'ideal.within_50m': 'inputRate',
  'ideal.dqm': 'inputAccuracy'
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

function attachCountryNames(records, cb) {
  waterfall([
    getAllCountries,

    (countryInfos, callback) => {
      let err = null;
      records = records.map((record) => {
        let countryCode = record.country;
        record.countryCode = countryCode;
        let target = find(countryInfos, (c) => {
          return c.country_code === countryCode;
        });
        if (target) {
          record.countryName = target.name;
        } else {
          err = new Error(`Found no country info for ${countryCode}`);
        }
        return record;
      });
      callback(err, records)
    }
  ], cb);
}

function getDataFromDb(cb) {
  waterfall([
    getExistingCountryCodes,

    (countryCodes, callback) => {
      map(countryCodes, getLatestCountryRow, callback);
    },

    attachCountryNames,

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
