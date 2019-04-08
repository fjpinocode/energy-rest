const csv = require('fast-csv');
const fs = require('fs');
const Boom = require('boom');
const moment = require('moment');

const parseCSV = (req, res, next) => {
    let consumptions = [];

    csv.fromPath(req.file.path, { delimiter: ';' })
        .on('error', (err) => {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.log(e);
            }
            return next(Boom.boomify(error, { statusCode: 500 }));
        })
        .on('data', (data) => {
            consumptions.push(data);
        })
        .on('end', () => {
            fs.unlinkSync(req.file.path);
            // Se elimina primera fila, donde vienen los nombres de las columnas
            consumptions = consumptions.slice(1);
            const validateError = _validateCSV(consumptions);

            if (validateError)
                return next(Boom.badRequest('error uploaded csv file', { validateError }));
            
            req.body.consumptions = consumptions;      
            next();
        });
};

const _validateCSV = (rows) => {
    let error;
    try {
        for (let i = 0; i < rows.length; i++) {
            error = _validateCSVRow(rows[i], i);
            if (error) {
                break;
            }
        }
    } catch (e) {
        console.log('error _validateCSV');
        error = {
            message: 'error validate'
        };
    }
    return error;
};

const _validateCSVRow = (row, i) => {
    let error;

    // CUPS
    if (!_validateCUPS(row[0])) {
        error = {
            col: 0,
            row: i + 1,
            message: 'Se encuentra CUPS no válido. Debe tener entre 20 y 22 dígitos alfanuméricos.'
        };
    // Date
    } else if (!_validateFormatDate(row[1])) {
        error = {
            col: 1,
            row: i + 1,
            message: 'Se encuentra fecha no válida. El formato de la fecha debe ser "DD/MM/YYYY"'
        };
    // Hour
    } else if (!_validateHour(row[2])) {
        error = {
            col: 2,
            row: i + 1,
            message: 'El campo hora debe recoger un entero entre 1 y 24'
        };
    // Consumption
    } else if (!_validateConsumption(row[3])) {
        error = {
            col: 3,
            row: i + 1,
            message: 'El campo de consumo debe ser numérico'
        };
    // Obtaining Method
    } else if (!_validateObtainMethod(row[4])) {
        error = {
            col: 4,
            row: i + 1,
            message: 'El campo método de obtención debe ser "R" o "E"'
        };
    }

    return error;
}

const _validateCUPS = (cups) => {
    let valid = false;
    if (cups && cups.length >= 20 && cups.length <= 22 ) {
        valid = true;
    }
    return valid;
}

const _validateFormatDate = (date) => {
    let valid = false;
    if (moment(date, "DD/MM/YYYY", true).isValid()) {
        valid = true;
    }
    return valid;
}

const _validateHour = (hour) => {
    let valid = false;
    if (hour && Number.isInteger(Number(hour)) && Number(hour) >= 1 && Number(hour) <= 24) {
        valid = true; 
    }
    return valid;
}

const _validateConsumption = (consumption) => {
    let valid = false;
    if (consumption && !isNaN(Number(consumption.replace(',', '.')))) {
        valid = true;
    }
    return valid;
}

const _validateObtainMethod = (obtMethod) => {
    let valid = false;
    if (obtMethod && (obtMethod === 'R' ||  obtMethod === 'E')) {
        valid = true;
    }
    return valid;
}

module.exports = {
    parseCSV
};
