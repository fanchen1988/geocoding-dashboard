import sheetRouter from './report-sheet';
import chartRouter from './report-chart';

export default function (app) {

  app.get('/', (req, res, next) => {
    res.redirect('/list');
  });

  app.get('/list', (req, res, next) => {
    res.send('This is list');
  });

  app.use('/sheet', sheetRouter());

  app.use('/chart', chartRouter());
}

