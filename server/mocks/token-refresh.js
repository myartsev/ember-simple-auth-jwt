/* eslint-env node */
'use strict';

module.exports = function(app) {
  const express = require('express');
  const bodyParser = require('body-parser');
  const jwt = require('jsonwebtoken');
  let tokenRefreshRouter = express.Router();

  tokenRefreshRouter.post('/', function(req, res) {
    jwt.verify(req.body.token, 'secret', function(err, decoded) {
      if (err) {
        res.status(401).send({
          error: err
        });
      } else {
        delete decoded.iat;
        delete decoded.exp;
        res.send({
          token: jwt.sign(decoded, 'secret', {
            expiresIn: 60
          })
        });
      }
    });
  });

  app.use('/api/token-refresh', bodyParser.json(), tokenRefreshRouter);
};
