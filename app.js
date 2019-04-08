require('./configs/config');

const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');
// TODO - Permitir CORS para pruebas en local
const cors = require('cors');

const { errorHandler } = require('./errorHandlers/errorHandler');

const app = express();

// TODO - Permitir CORS
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connecting mongo
mongoose.set('useFindAndModify', true);
const dbURI = process.env.URLDB;
const opts = { useNewUrlParser: true };
mongoose.connect(dbURI, opts);
const conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', () => {
    console.log('DATA BASE CONNECTION - SUCCESS');
});

// Routing
app.use('/', indexRouter);

// Handling Errors
app.use(errorHandler);

module.exports = app;
