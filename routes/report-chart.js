import {Router} from 'express';


export default function() {

  const chartRouter = Router();

  chartRouter.get('/', (req, res, next) => {
  });

  return chartRouter;
}

