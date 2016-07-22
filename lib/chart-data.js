import {waterfall, map, parallel} from 'async';
import {get, pickBy, reverse} from 'lodash';
import mongoServer from './mongo';
import {getCountryNameByCode} from './stitch-api';
import {
  getRecentExpiredReportMeta, getLatestLiveReportMeta,
  getLatestDensityData, getLatestSilverPopularStats,
  getDensity, getDqmStatsAccuracy, getDqmStasComprehensiveness
} from './reports-data';

const reportsDbName = 'reports';
const reportsColName = 'reports';

function getLiveAndExpiredReportMeta(countryName, cb) {
  parallel({
    live: (callback) => {
      getLatestLiveReportMeta(countryName, callback);
    },

    expired: (callback) => {
      getRecentExpiredReportMeta(countryName, 5, callback);
    }
  }, (err, results) => {
    if (err) {
      cb(err);
    } else {
      cb(null, [results.live].concat(results.expired));
    }
  });
}

function attachReportData(meta, cb) {
  let reportId = meta._id;
  parallel({
    density: (callback) => {
      getLatestDensityData(reportId, callback);
    },

    dqmStats: (callback) => {
      getLatestSilverPopularStats(reportId, callback);
    }
  }, (err, results) => {
    if (err) {
      cb(err);
    } else {
      meta.density = getDensity(results.density);
      meta.accuracy = getDqmStatsAccuracy(results.dqmStats);
      meta.comprehensiveness = getDqmStasComprehensiveness(results.dqmStats);
      cb(null, meta);
    }
  });
}

const fieldFilter = {
  version: true,
  country: true,
  density: true,
  accuracy: true,
  comprehensiveness: true
};

function filterKeys(record, cb) {
  record = pickBy(record, (_v, k) => {return fieldFilter[k];});
  cb(null, record);
}

export function getRecentGeocodingData(countryCode, cb) {
  waterfall([
    (callback) => {
      getCountryNameByCode(countryCode, callback)
    },

    getLiveAndExpiredReportMeta,

    (metas, callback) => {
      map(metas, attachReportData, callback);
    },

    (records, callback) => {
      map(records, filterKeys, callback);
    },

    (records, callback) => {
      callback(null, reverse(records));
    }
  ], cb);
}

