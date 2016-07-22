import {waterfall} from 'async';
import mongoServer from './mongo';

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

export function getLiveRunInfo(dataset, cb) {
  waterfall([
    (callback) => {
      getPodInfo(dataset, callback);
    },

    (podInfo, callback) => {
      let pod_id = podInfo._id.toString();
      let status = 'live';
      let opt = {sort: [['start', -1]]};
      mongoServer.findOne(podRunnerDbName, runInfoColName, {pod_id, status}, opt, callback);
    }
  ], cb);
}

