import {waterfall, map} from 'async';
import request from 'request';
import {includes, find, get, isArray, isEmpty, pickBy} from 'lodash';
import mongoServer from './mongo';
import config from './config';

const exsistenceThreshold = 0.28;

const reportsDbName = 'reports';
const reportsColName = 'reports';
const densityColName = 'reports_density';
const dqmStatsColName = 'reports_dqm_stats';

const countryPipeline = [
  {
    $group: {
      _id: '$country'
    }
  },
  {
    $project: {
      _id: 0,
      countryName: '$_id'
    }
  }
];


function getLatestLiveReportMetaEachCountry(cb) {
  waterfall([
    getExistingCountries,

    (countries, callback) => {
      map(countries, getLatestLiveReportMeta, callback);
    },

    attachCountryCodes
  ], cb);
}

function getExistingCountries(cb) {
  mongoServer.aggregate(reportsDbName, reportsColName, countryPipeline, (err, result) => {
    if (err) {
      cb(err);
    } else {
      let countries = result
        .map((item) => { return item.countryName; })
        .filter((item) => { return item && item.trim()});
      cb(null, countries);
    }
  });
}

function getLatestLiveReportMeta(countryName, cb) {
  let query = {
    view_type: 'stable',
    table_type: 'places',
    country: countryName,
    status: 'live'
  };
  let opt = {
    sort: {timestamp: -1},
    fields: {
      _id: 1,
      version: 1,
      country: 1
    }
  };
  mongoServer.findOne(reportsDbName, reportsColName, query, opt, cb);
}

function attachCountryCodes(countryMetas, cb) {
  waterfall([
    (callback) => {
      request.get({url: config.stitch_api.url + 'countries'}, callback);
    },

    (resp, body, callback) => {
      let countryIds = JSON.parse(body);
      countryMetas = countryMetas.map((meta) => {
        let countryName = meta.country;
        let item = find(countryIds, (v, _i) => { return v.name === countryName; });
        if (item) {
          meta.countryCode = item.country_code;
          meta.tier = item.tier;
        } else {
          return callback(new Error(`Fond no country code or tier for ${countryName}`));
        }
        return meta;
      });
      callback(null, countryMetas);
    }
  ], cb);
}

const tierGoalMapping = {
  1: 0.85,
  2: 0.8,
  3: 0.7,
  4: 0.7
};

const tomtomCountry = [
  'ar', 'at', 'au', 'be', 'ca', 'cl', 'co', 'de', 'dk', 'eg', 'fi',
  'fr', 'gb', 'gr', 'hk', 'id', 'ie', 'in', 'lu', 'my', 'nl', 'no',
  'nz', 'pe', 'ph', 'pl', 'pr', 'sg', 'th', 'tr', 've', 'vn', 'za'
];

const loqateCountry = [
  'cz', 'hr', 'hu', 'ch', 'il', 'br', 'it',
  'mx', 'pt', 'ru', 'kr', 'es', 'se', 'tw'
];

function attachFixedDatas(countryRows, cb) {
  countryRows.map((row) => {
    row.goal = tierGoalMapping[row.tier];
    if (includes(tomtomCountry, row.countryCode)) {
      row.geocoder = 'Tomtom';
    } else if (includes(loqateCountry, row.countryCode)) {
      row.geocoder = 'Loqate';
    } else {
      row.geocoder = '';
    }
    return row;
  });
  cb(null, countryRows);
}

function attachDensity(countryMeta, cb) {
  let query = {
    report_id: countryMeta._id
  };
  let opt = {
    sort: {timestamp: -1},
    fields: {
      'data.density.latitude': 1,
      'data.density.geocode_level': 1,
      'data.density.geocode_confidence': 1
    }
  };
  mongoServer.findOne(reportsDbName, densityColName, query, opt, (err, densityRow) => {
    if (err) {
      cb(err);
    } else {
      countryMeta.density = get(densityRow, 'data.density.latitude');
      countryMeta.geolevelDensity = get(densityRow, 'data.density.geocode_level');
      countryMeta.geolevelConfidence = get(densityRow, 'data.density.geocode_confidence');
      cb(null, countryMeta);
    }
  });
}

function attachDqmStats(countryRow, cb) {
  let pipeline = [
    {
      $match: {
        report_id: countryRow._id,
        'config.metal': 'silver_popular'
      }
    },
    { $sort: {timestamp: -1} },
    { $limit: 1 },
    { $unwind: '$data' },
    { $match: {'data.threshold': exsistenceThreshold} },
    {
      $project: {
        'data.avg_attribute_accuracy.geocode.score': 1,
        'data.avg_attribute_comprehensiveness.geocode.score': 1
      }
    }
  ];
  mongoServer.aggregate(reportsDbName, dqmStatsColName, pipeline, (err, result) => {
    if (err) {
      cb(err);
    } else if (!isArray(result) || isEmpty(result)) {
      cb(new Error (`Get none dqm stats for ${countryRow.country}`));
    } else {
      let dqmStats = result[0];
      countryRow.accuracy = get(dqmStats, 'data.avg_attribute_accuracy.geocode.score');
      countryRow.comprehensiveness = get(dqmStats, 'data.avg_attribute_comprehensiveness.geocode.score');
      cb(null, countryRow);
    }
  });
}

const fieldFilter = {
  country: true,
  tier: true,
  version: true,
  density: true,
  geolevelDensity: true,
  geolevelConfidence: true,
  accuracy: true,
  comprehensiveness: true,
  goal: true,
  geocoder: true,
  countryCode: true
};

function filterKeys(record, cb) {
  record = pickBy(record, (_v, k) => {return fieldFilter[k];});
  cb(null, record);
}


export function getGeneralDataEachCountry(cb) {
  waterfall([
    getLatestLiveReportMetaEachCountry,

    attachFixedDatas,

    (countryMetas, callback) => {
      map(countryMetas, attachDensity, callback);
    },

    (countryRows, callback) => {
      map(countryRows, attachDqmStats, callback);
    },

    (countryRows, callback) => {
      map(countryRows, filterKeys, callback);
    }
  ], cb);
}

