import {waterfall, map} from 'async';
import {includes, find, get, pickBy} from 'lodash';
import {getAllCountries} from './stitch-api';
import {
  getReportsExistingCountries, getLatestLiveReportMeta,
  getLatestDensityData, getLatestSilverPopularStats,
  getDensity, getGeoLevelDensity, getGeoLevelConfidence,
  getDqmStatsAccuracy, getDqmStasComprehensiveness
} from './reports-data';


function getLatestLiveReportMetaEachCountry(cb) {
  waterfall([
    getReportsExistingCountries,

    (countries, callback) => {
      map(countries, getLatestLiveReportMeta, callback);
    },

    attachCountryCodes
  ], cb);
}

function attachCountryCodes(countryMetas, cb) {
  waterfall([
    getAllCountries,

    (countries, callback) => {
      countryMetas = countryMetas.map((meta) => {
        let countryName = meta.country;
        let item = find(countries, (v, _i) => { return v.name === countryName; });
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
  getLatestDensityData(countryMeta._id, (err, densityRow) => {
    if (err) {
      cb(err);
    } else {
      countryMeta.density = getDensity(densityRow);
      countryMeta.geolevelDensity = getGeoLevelDensity(densityRow);
      countryMeta.geolevelConfidence = getGeoLevelConfidence(densityRow);
      cb(null, countryMeta);
    }
  });
}

function attachDqmStats(countryRow, cb) {
  getLatestSilverPopularStats(countryRow._id, (err, dqmStats) => {
    if (err) {
      cb(err);
    } else {
      countryRow.accuracy = getDqmStatsAccuracy(dqmStats);
      countryRow.comprehensiveness = getDqmStasComprehensiveness(dqmStats);
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

