const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'tmp/csv/' });

const consumptionsCtrl = require('../../controllers/consumptions/consumptionsCtrl');
const { parseCSV } = require('../../middlewares/csvHandler');

router.get('/:cups', consumptionsCtrl.getConsumptions);
router.post('/', consumptionsCtrl.saveConsumptions);
router.post('/csv', upload.single('csvfile'), parseCSV, consumptionsCtrl.saveConsumptions);
router.put('/:id', consumptionsCtrl.updateConsumption);
router.delete('/:id', consumptionsCtrl.deleteConsumption);

module.exports = router;