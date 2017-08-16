[![Build Status](https://travis-ci.org/myartsev/ember-simple-auth-jwt.svg?branch=master)](https://travis-ci.org/myartsev/ember-simple-auth-jwt)

This is an extension to the [ember-simple-auth](https://github.com/simplabs/ember-simple-auth) library that provides JWT authentication and authorization with automatic token refresh.

**User's credentials are exchanged between the
Ember.js app and the backend server in the POST request body; thus you have to make sure that this connection uses HTTPS in production!**

This library is inspired by [ember-simple-auth-token](https://github.com/jpadilla/ember-simple-auth-token), which unfortunately seems to have been mostly abandoned and does not play nicely with the latest versions of Ember and ember-simple-auth.

## Example App

[![Greenkeeper badge](https://badges.greenkeeper.io/myartsev/ember-simple-auth-jwt.svg)](https://greenkeeper.io/)

__Ember Simple Auth JWT comes with a
[dummy app](tests/dummy)
that implements a complete JWT auth solution__ with authentication against
the application's own server. To start it:

```
git clone https://github.com/myartsev/ember-simple-auth-jwt.git
cd ember-simple-auth-jwt
npm install && ember serve
```

and go to [http://localhost:4200](http://localhost:4200).

## Installation
Installing the library is as easy as:

```bash
ember install ember-simple-auth-jwt
```

## Walkthrough
Once the library is installed, set up the JWT  authorizer and authenticator
```js
// app/authenticators/jwt.js
import JWTAuthenticator from 'ember-simple-auth-jwt/authenticators/jwt';

export default JWTAuthenticator.extend();
```

```js
// app/authorizers/jwt.js
import JWTBearer from 'ember-simple-auth-jwt/authorizers/jwt';

export default JWTBearer.extend();
```

And now the rest is the same as [ember-simple-auth](https://github.com/simplabs/ember-simple-auth#walkthrough).  
The dummy app in this project is also a good resource to get you started.
