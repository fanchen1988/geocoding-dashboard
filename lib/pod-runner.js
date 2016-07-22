import {waterfall, parallel} from 'async';
import mongoServer from './mongo';
import {getScarecrowFolderByCode} from './stitch-api';

const podRunnerDbName = 'pod-runner';
const podInfoColName = 'pod_info';
const runInfoColName = 'run_info';

function getPodInfo(dataset_id, cb) {
  mongoServer.findOne(podRunnerDbName, podInfoColName, {dataset_id}, (err, podInfo) => {
    if (err) {
      cb(err);
    } else if (!podInfo) {
      cb(new Error(`Found no pod info for ${dataset_id}`));
    } else {
      cb(null, podInfo);
    }
  });
}

function queryRunInfo(dataset, query, cb) {
  waterfall([
    (callback) => {
      getPodInfo(dataset, callback);
    },

    (podInfo, callback) => {
      query.pod_id = podInfo._id.toString();
      let opt = {sort: [['start', -1]]};
      mongoServer.findOne(podRunnerDbName, runInfoColName, query, opt, callback);
    }
  ], cb);
}

export function getLiveRunInfo(dataset, cb) {
  queryRunInfo(dataset, {status: 'live'}, cb);
}

const buildPathPrefix = '/apps/extract/poi';

export function getLiveBuildPath(countryCode, dataset, version, cb) {
  parallel({
    name: (callback) => {
      queryRunInfo(dataset, {status: 'live', version}, (err, runInfo) => {
        if (err) {
          callback(err);
        } else {
          callback(null, runInfo.name);
        }
      });
    },

    folder: (callback) => {
      getScarecrowFolderByCode(countryCode, callback);
    }
  }, (err, results) => {
    if (err) {
      cb(err);
    } else {
      let buildPath = `${buildPathPrefix}/${results.folder}/output/${results.name}`;
      cb(null, buildPath);
    }
  });

}

