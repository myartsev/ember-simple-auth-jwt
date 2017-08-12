/* eslint-env node */
'use strict';

module.exports = function(app) {
  const express = require('express');
  const bodyParser = require('body-parser');
  const authenticate = require('../authenticate.js');
  let secretStuffRouter = express.Router();

  secretStuffRouter.get('/', function(req, res) {
    res.send("For authenticated eyes only!");
  });

  app.use('/api/secret-stuff', bodyParser.json(), authenticate, secretStuffRouter);
};
