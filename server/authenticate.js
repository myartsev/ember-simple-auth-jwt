module.exports = function(req, res, next) {
  var jwt = require('jsonwebtoken');

  var authorizationHeader = req.headers.authorization || '';
  var token = authorizationHeader.split('Bearer ')[1];

  if (!token) {
    res.status(401).send('Unauthorized Access');
    return;
  }

  jwt.verify(token, 'secret', function(err, decoded) {
    if (err) {
      res.status(401).send('Unauthorized Token');
    } else {
      next();
    }
  });
}
