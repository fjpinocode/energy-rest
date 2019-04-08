const express = require('express');
const router = express.Router();

const consumptionsCtrl = require('../../controllers/consumptions/consumptionsCtrl');

router.get('/', consumptionsCtrl.getCups);
router.delete('/:cups', consumptionsCtrl.deleteConsumptionsByCups);

module.exports = router;
