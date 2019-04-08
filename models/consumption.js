const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const consumptionSchema = new Schema({
    cups: { 
        type: String,
        maxlength: [22, 'Max length CUPS: 22'], 
        minlength: [20, 'Min length CUPS: 20'],
        required: [true, 'CUPS is required']
    },
    date: { 
        type: Date, 
        required: [true, 'Date is required']
    },
    hour: { 
        type: Number,
        min: 1,
        max: 24,
        required: [true, 'Hour is required']
    },
    consumption: {
        type: Number,
        required: [true, 'Consumption is required']
    },
    obtainingMethod: {
        type: String,
        enum: ['R', 'E'],
        required: [true, 'Obtaining Method is required']
    },
    status: {
        type: Boolean,
        default: true
    }
});

consumptionSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

// TODO - En una mejora hacer única la condición cups+date+hour
// En caso de aceptar esta condición revisar borrado.
// consumptionSchema.index({ cups: 1, date: 1, hour: 1 }, { unique: true });

Consumption = mongoose.model('Consumption', consumptionSchema);

module.exports = Consumption;
