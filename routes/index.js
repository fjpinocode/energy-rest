const express = require('express');
const router = express.Router();

const consumptionsRouter = require('./consumptions/consumptions');
const cupsRouter = require('./cups/cups');

router.use('/consumptions', consumptionsRouter);
router.use('/cups', cupsRouter);
// Others
router.all('*', (req, res, next) => {
  // * Important: Esta línea se comenta cuando se usa inspect de express
  // next(Boom.notFound('Invalid Request'));
  console.log('-----------');
  next();
});

module.exports = router;
