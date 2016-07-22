import request from 'request';
import {cloneDeep} from 'lodash';
import config from './config';

const taskSubmitHeader = {'Content-Type': 'application/json'};

const baseUrl = config.vineyard_api.url;
const tasksUrl = baseUrl + '/tasks';
const geocodingChannel = config.vineyard_api.geocoding_channel;

export function getTaskStatus(taskId, cb) {
  let getTaskUrl = tasksUrl + '/' + taskId;
  request.get({ url: getTaskUrl}, (err, resp, body) => {
    if (err && !body) {
      err = `Found no task for ${taskId}: ${err}`;
      cb(err);
    } else {
      try {
        cb(null, JSON.parse(body).status);
      } catch (err) {
        cb(err);
      }
    }
  });
}

export function submitGeocodingTask(payload, cb) {
  let submitUrl = tasksUrl + '/' + geocodingChannel;
  payload = cloneDeep(payload);
  payload.system = { submitter: {host: 'geocoding-dashboard'} };
  payload = { task: payload };
  let requestConfig = {
    url: submitUrl,
    body: JSON.stringify(payload),
    headers: taskSubmitHeader
  };
  request.put(requestConfig, (err, resp, body) => {
    if (err && !body) {
      err = "No body: " + err.toString();
      cb(err);
    } else {
      try {
        let taskId = JSON.parse(body)._id;
        cb(null, taskId);
      } catch (err) {
        cb(err);
      }
    }
  });
}

