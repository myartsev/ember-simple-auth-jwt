/* eslint-env node */
'use strict';

module.exports = function(app) {
  const express = require('express');
  const bodyParser = require('body-parser');
  const jwt = require('jsonwebtoken');
  let tokenAuthRouter = express.Router();

  tokenAuthRouter.post('/', function(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password) {
      res.status(401).send({
        error: 'Failed to provide username/password'
      });
      return;
    }

    // Obviously you'd want to look this up from a DB
    // or some other data source. Don't store plaintext
    // passwords (!!). Encrypt and compare.
    if (username === "letme" && password === "in") {
      // You can put any data in here that you want in the
      // payload of the JWT (such as username, name, last name, etc)
      // For the purposes of this demo, the payload is empty
      // since we don't need to know anything about the user
      // on the front-end, we are just using this for authentication so far!
      let payload = {};

      jwt.sign(payload, 'secret', {
        expiresIn: 30
      }, function(err, token) {
        res.send({
          token: token
        });
      });
    } else {
      res.status(401).send({
        error: 'Invalid credentials'
      });
    }
  });

  app.use('/api/token-auth', bodyParser.json(), tokenAuthRouter);
};
