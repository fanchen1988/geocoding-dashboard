import * as path from 'path';
import {getGeosummarizerData, getGeneralDataEachCountry} from '../lib';

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

  app.get('/chart', (req, res, next) => {
    res.render('chart-loader');
  });

  app.get('/chart/:countryCode', (req, res, next) => {
    res.send(req.params.countryCode);
  });

  app.get('/chart/:countryCode/data', (req, res, next) => {
    res.send(req.params.countryCode);
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

