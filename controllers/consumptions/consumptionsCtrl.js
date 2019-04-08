const Boom = require('boom');

const Consumption = require('../../models/consumption');

const saveConsumptions = (req, res, next) => {
    let rows = req.body['consumptions'];
    const consumptions = [];

    if (!rows)
        return next(Boom.badRequest('Consumptions Array not found'));

    // En caso de recibir nuevos consumos desde petición no csv.
    try {
        if (typeof rows === "string")
            rows = JSON.parse(rows);
    } catch(e) {
        return next(Boom.badRequest('Consumptions Array not found'));
    }

    if (!Array.isArray(rows) || rows.length === 0)
        return next(Boom.badRequest('Consumptions Array not found'));

    try {
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            
            let params = {};
            params.cups = row[0];
            params.hour = Number(row[2]);
            params.consumption = Number(row[3].replace(',', '.'));
            params.obtainingMethod = row[4];

            let aux = row[1].split('/');
            params.date = new Date(aux[2], aux[1] - 1, aux[0]);

            const cons = new Consumption(params);
            consumptions.push(cons);
        }
    } catch(e) {
        return next(Boom.badRequest('Parse Consumption Error'));
    }

    Consumption.insertMany(consumptions, (error, consumptionsDB) => {
        if (error)
            return next(Boom.boomify(error, { statusCode: 500 }));
        
        return res.json({
            ok: true,
            consumptionsNew: consumptionsDB.length
        });
    });
};

const getConsumptions = (req, res, next) => {
    let skip = req.query.from || 0;
    skip = Number(skip);

    let max = req.query.max || 20;
    max = Number(max);

    let sortField = req.query.sort || '_id';
    let dir = (req.query.dir && req.query.dir === 'desc') ? -1 : 1;

    let query = {};
    query.cups = req.params.cups;
    if (req.query && req.query.status !== undefined)
        query.status = req.query.status;
    else
        query.status = true;
    
    let sort = {};
    sort[sortField] = dir;

    Consumption.find(query)
    .sort(sort)
    .skip(skip)
    .limit(max)
    .exec((error, consumptionsDB) => {
        if (error)
            return next(Boom.boomify(error, { statusCode: 500 }));

        Consumption.countDocuments(query, (error, counter) => {
            return res.json({
                ok: true,
                consumptionsDB,
                total: counter
            });
        });
    });
};

const getCups = (req, res, next) => {
    let skip = req.query.from || 0;
    skip = Number(skip);

    let max = req.query.max || 20;
    max = Number(max);

    let sortField = req.query.sort || '_id';
    let dir = (req.query.dir && req.query.dir === 'desc') ? -1 : 1;
    
    let sort = {};
    sort[sortField] = dir;

    Consumption.aggregate(
        [ 
            { $match: { status: true}},
            { $group : { _id : "$cups" } },
            // { $skip: skip },
            // { $limit: max },
        ],
        (error, consumptionsDB) => {
            if (error)
                return next(Boom.boomify(error, { statusCode: 500 }));
            
            let cups = [];
            let count = consumptionsDB.length;
            let length = count;

            for (let i = skip; i < length; i++) {
                try {
                    cups.push(consumptionsDB[i]['_id']);
                } catch(e) {
                    console.log(e);
                }
            }

            return res.json({
                ok: true,
                cups,
                total: count
            });
        }
    );
};

const updateConsumption = (req, res, next) => {
    const consumptionId = req.params.id;
    const query = { _id: consumptionId };
    const body = req.body;
    let bodyUpdated = {};

    try {
        bodyUpdated = _parseConsumptionData(body);
    } catch(e) {
        return next(Boom.badRequest('Updated data error'));
    }

    Consumption.findOneAndUpdate(
        query,
        bodyUpdated,
        { new: true, runValidators: true, context: 'query' },
        (error, consumptionDB) => {
            if (error)
                return next(Boom.boomify(error, { statusCode: 500 }));

            if (!consumptionDB)
                return next(Boom.badRequest('Consumption Id not found'));

            return res.json({
                ok: true,
                consumptionDB
            });
        }
    );
};

const deleteConsumption = (req, res, next) => {
    const consumptionId = req.params.id;
    const query = { _id: consumptionId };

    Consumption.findOne(query)
    .exec((error, consumptionDB) => {
        if (error)
            return next(Boom.boomify(error, { statusCode: 500 }));

        if (!consumptionDB)
            return next(Boom.badRequest('Consumption Id not found'));

        consumptionDB.status = false;

        consumptionDB.save((error, consumptionDeleted) => {
            if (error)
                return next(Boom.boomify(error, { statusCode: 500 }));

            res.json({
                ok: true,
                consumptionDeleted,
                message: 'Consumption deleted'
            });
        });
    });
};

const deleteConsumptionsByCups = (req, res, next) => {
    const cups = req.params.cups;
    const query = { cups };

    Consumption.updateMany(query, { status: false }, (error, counterDeleted) => {
        if (error)
            return next(Boom.boomify(error, { statusCode: 500 }));
        
        return res.json({
            ok: true,
            counterDeleted,
            message: 'Consumptions deleted'
        });
    });
};

const _parseConsumptionData = (body) => {
    let res = {};

    if (body.cups) {
        res.cups = body.cups;
    }

    if (body.date) {
        let aux = body.date.split('/');
        res.date = new Date(aux[2], aux[1] - 1, aux[0]);
    }

    if (body.hour) {
        res.hour = Number(body.hour);
    }

    if (body.consumption) {
        let aux = body.consumption;
        res.consumption = Number(aux.replace(',', '.'));
    }

    if (body.obtainingMethod) {
        res.obtainingMethod = body.obtainingMethod;
    }

    return res;
};

module.exports = {
    saveConsumptions,
    getConsumptions,
    getCups,
    updateConsumption,
    deleteConsumption,
    deleteConsumptionsByCups
};
