import {getLiveBuildPath} from './pod-runner';
import {submitGeocodingTask, getTaskStatus} from './vineyard';
import {cloneDeep} from 'lodash';
import {waterfall} from 'async';
import mongoServer from './mongo';

const geoDbName = 'geocoding';
const geoRunColName = 'geocoding_task';

const geosumVineyardTaskTmplt = {
  type: 'GeosummarizerEvalTask',
  impl: {
    repo: 'git@github.com:Factual/data-projects.git',
    dir: 'projects/geocoding/evaluation',
    branch: 'feature/geosummarizer_vineyard'
  }
};

function getGeoSumVineyardTaskCfg(country, build_path, build_version) {
  let cfg = cloneDeep(geosumVineyardTaskTmplt);
  cfg.init_data = { country, build_path, build_version };
  return cfg;
}

export function getGeoSumTaskInfo(dataset, cb) {
  waterfall([
    (callback) => {
      let query = {dataset, type: 'geosummarizer'};
      let opt = {sort: [['timestamp', -1]]};
      mongoServer.findOne(geoDbName, geoRunColName, query, opt, (err, result) => {
        if (err) {
          callback(err);
        } else if (!result || !result.task_id) {
          callback(new Error(`Found no task id for ${dataset}`));
        } else {
          callback(null, result.task_id);
        }
      });
    },

    (taskId, callback) => {
      getTaskStatus(taskId, (err, taskStatus) => {
        if (err) {
          cb(err);
        } else {
          cb(null, {taskId, taskStatus});
        }
      });
    }
  ], cb);
}

export function kickOffGeoSumRun(country_code, dataset, version, cb) {
  waterfall([
    (callback) => {
      getLiveBuildPath(country_code, dataset, version, callback);
    },

    (buildPath, callback) => {
      let vineyardCfg = getGeoSumVineyardTaskCfg(country_code, buildPath, version);
      submitGeocodingTask(vineyardCfg, callback);
    },

    (task_id, callback) => {
      let timestamp = new Date().getTime();
      let type = 'geosummarizer';
      let geoRunTask = { country_code, dataset, version, task_id, timestamp, type };
      mongoServer.insert(geoDbName, geoRunColName, geoRunTask, (err, result) => {
        if (err) {
          console.error(err);
        }
        callback(null, task_id);
      });
    }
  ], cb);
}
