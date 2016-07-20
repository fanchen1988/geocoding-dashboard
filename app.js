import express from 'express';
import bodyParser from 'body-parser';
import * as path from 'path';
import routesSetup from './routes';

const app = express();

app.set('views', path.join(__dirname, './views'));  //default set
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, './views')));
app.use(express.static(path.join(__dirname, './public')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  console.log('Request on:', req.originalUrl);
  next();
});
routesSetup(app);


const port = process.env.PORT || 3000;
app.listen(port, 'localhost', (err) => {
  if (err) {
    console.warn(err);
  }
  console.log(`Listening at localhost: ${port}`);
});

