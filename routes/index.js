import * as path from 'path';
import {
  getGeosummarizerData, getGeneralDataEachCountry,
  getRecentGeocodingData
} from '../lib';

const chartUrl = '/chart/';

function getDataUrl(req) {
  return path.join(req.originalUrl, 'data');
}

export default function (app) {

  app.get('/', (req, res, next) => {
    res.redirect('/generic');
  });

  app.get('/generic', (req, res, next) => {
    res.render('generic', {chartUrl, genericDataUrl: getDataUrl(req)});
  });

  app.get('/generic/data', (req, res, next) => {
    getGeneralDataEachCountry((err, results) => {
      res.send(results);
    });
  });

  app.get('/chart/:countryCode', (req, res, next) => {
    let countryCode = req.params.countryCode;
    let chartDataUrl = getDataUrl(req);
    res.render('chart-loader', {countryCode, chartDataUrl});
  });

  app.get('/chart/:countryCode/data', (req, res, next) => {
    getRecentGeocodingData(req.params.countryCode, (err, results) => {
      if (err) {
        res.status(404).send(error.toString());
      } else {
        res.send(JSON.stringify(results));
      }
    });
  });

  app.get('/evaluation/:source', (req, res, next) => {
    let source = req.params.source;
    let error = null;
    let renderPath = null;
    let pageConfig = {};
    switch (source) {
      case 'geosummarizer':
        renderPath = 'geosummarizer';
        pageConfig.geosummarizerDataUrl = getDataUrl(req);
        break;
      default:
        error = new Error(`Found no Evaluation Source ${source}`);
        break;
    }
    if (error) {
      res.status(404).send(error.toString());
    } else {
      res.render(renderPath, pageConfig);
    }
  });

  app.get('/evaluation/:source/data', (req, res, next) => {
    let source = req.params.source;
    console.log('Request on', source, 'data');
    getGeosummarizerData((err, rows) => {
      res.send(JSON.stringify(rows));
    });
  });
}

