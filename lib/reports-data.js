import {isArray, isEmpty, get, round} from 'lodash';
import mongoServer from './mongo';

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

export function getReportsExistingCountries(cb) {
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

function getRecentReportMeta(country, status, num, cb) {
  if (!cb && typeof num === 'function') {
    cb = num;
    num = 1;
  }
  let query = {
    view_type: 'stable',
    table_type: 'places',
    country,
    status
  };
  let sort = {timestamp: -1};
  let project = {
    _id: 1,
    version: 1,
    country: 1
  };

  let pipeline = [
    { $match: query },
    { $sort: sort },
    { $limit: num },
    { $project: project },
  ];
  mongoServer.aggregate(reportsDbName, reportsColName, pipeline, cb);
}

export function getLatestLiveReportMeta(countryName, cb) {
  getRecentReportMeta(countryName, 'live', 1, (err, results) => {
    if (err) {
      cb(err);
    } else if (!isArray(results) || isEmpty(results)) {
      cb(new Error (`Get no live report meta for ${countryName}`));
    } else {
      cb(null, results[0]);
    }
  });
}

export function getRecentExpiredReportMeta(countryName, num, cb) {
  if (!cb && typeof num === 'function') {
    cb = num;
    num = 1;
  }
  getRecentReportMeta(countryName, 'expired', num, (err, results) => {
    if (err) {
      cb(err);
    } else if (!isArray(results) || isEmpty(results)) {
      cb(new Error (`Get no expired report meta for ${countryName}`));
    } else {
      cb(null, results);
    }
  });
}

export function getLatestDensityData(reportId, cb) {
  let query = {
    report_id: reportId
  };
  let opt = {
    sort: {timestamp: -1},
    fields: {
      'data.density.latitude': 1,
      'data.density.country': 1,
      'data.density.geocode_level': 1,
      'data.density.geocode_confidence': 1
    }
  };
  mongoServer.findOne(reportsDbName, densityColName, query, opt, cb);
}

export function getLatestSilverPopularStats(reportId, cb) {
  let pipeline = [
    {
      $match: {
        report_id: reportId,
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
      cb(new Error (`Get none Silver Popular Stats for ${reportId}`));
    } else {
      cb(null, result[0]);
    }
  });
}

export function getDensity(densityRow) {
  let density = get(densityRow, 'data.density.latitude') * 1.0 / get(densityRow, 'data.density.country');
  return round(density, 3);
}

export function getGeoLevelDensity(densityRow) {
  return get(densityRow, 'data.density.geocode_level');
}

export function getGeoLevelConfidence(densityRow) {
  return get(densityRow, 'data.density.geocode_confidence');
}

export function getDqmStatsAccuracy(dqmStatsRow) {
  return get(dqmStatsRow, 'data.avg_attribute_accuracy.geocode.score');
}

export function getDqmStasComprehensiveness(dqmStatsRow) {
  return get(dqmStatsRow, 'data.avg_attribute_comprehensiveness.geocode.score');
}

