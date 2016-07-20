const chartUrl = '/chart/';
const genericDataUrl = '/generic/data';

export default function (app) {

  app.get('/', (req, res, next) => {
    res.redirect('/generic');
  });

  app.get('/generic', (req, res, next) => {
    res.render('generic', {chartUrl, genericDataUrl});
  });

  app.get('/generic/data', (req, res, next) => {
    res.send('generic data');
  });

  app.get('/chart/:countryCode', (req, res, next) => {
    res.send(req.params.countryCode);
  });

  app.get('/chart/:countryCode/data', (req, res, next) => {
    res.send(req.params.countryCode);
  });

  app.get('/evaluation/:source', (req, res, next) => {
    res.send(req.params.source);
  });

  app.get('/evaluation/:source/data', (req, res, next) => {
    res.send(req.params.source);
  });
}

