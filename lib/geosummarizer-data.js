import {waterfall, map} from 'async';
import {filter, pickBy, mapKeys, reduce, merge} from 'lodash';
import {getAllCountries} from './stitch-api';
import {getLiveRunInfo} from './pod-runner';
import mongoServer from './mongo';

const geoDbName = 'geocoding';
const geoSumEvalColName = 'geosummarizer_eval';

const fieldNameMapping = {
  'countryCode': 'countryCode',
  'countryName': 'countryName',
  'tier': 'tier',
  'version': 'version',
  'liveVersion': 'liveVersion',
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

function attachCountryGeosummarizer(countryInfo, cb) {
  let country = countryInfo.countryCode;
  let opt = {sort: [['_id', -1]]};
  mongoServer.findOne(geoDbName, geoSumEvalColName, {country}, opt, (err, result) => {
    if (err) {
      cb(err);
    } else {
      cb(null, merge(result, countryInfo));
    }
  });
}

function sortCountries(records, cb) {
  records = records.sort((a, b) => {
    let ifHasGeoA = !!a.version;
    let ifHasGeoB = !!b.version;
    if (ifHasGeoA ^ ifHasGeoB) {
      return ifHasGeoA ? -1 : 1;
    } else {
      return a.tier - b.tier;
    }
  });
  cb(null, records);
}

function attachLiveVersion(countryInfo, cb) {
  waterfall([
    (callback) => {
      getLiveRunInfo(countryInfo.dataset, (err, run) => {
        run = run || {};
        callback(null, run);
      });
    },

    (runInfo, callback) => {
      countryInfo.liveVersion = runInfo.version;
      callback(null, countryInfo);
    }
  ], cb);
}

function filterCountryAndFields(countryInfos, cb) {
  waterfall([
    (callback) => {
      map(countryInfos, attachLiveVersion, callback);
    },

    (countryInfos, callback) => {
      countryInfos = filter(countryInfos, (c) => { return !!c.liveVersion; });
      countryInfos = countryInfos.map((c) => {
        return {
          countryCode: c.country_code,
          countryName: c.name,
          tier: c.tier,
          liveVersion: c.liveVersion
        };
      });
      callback(null, countryInfos);
    },

  ], cb);
}

export function getGeosummarizerData(cb) {
  waterfall([
    getAllCountries,

    filterCountryAndFields,

    (countryInfos, callback) => {
      map(countryInfos, attachCountryGeosummarizer, callback);
    },

    sortCountries,

    (records, callback) => {
      map(records, filterResult, callback);
    }
  ], cb);
}

