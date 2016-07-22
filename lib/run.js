import {getLiveBuildPath} from './pod-runner';
import {submitGeocodingTask} from './vineyard';
import {cloneDeep} from 'lodash';
import {waterfall} from 'async';

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

export function kickOffRun(countryCode, dataset, version, cb) {
  waterfall([
    (callback) => {
      getLiveBuildPath(countryCode, dataset, version, callback);
    },

    (buildPath, callback) => {
      let vineyardCfg = getGeoSumVineyardTaskCfg(countryCode, buildPath, version);
      submitGeocodingTask(vineyardCfg, (err, taskId) => {
        if (err) {
          callback(err);
        } else {
          callback(null, taskId);
        }
      });
    }
  ], cb);
}
