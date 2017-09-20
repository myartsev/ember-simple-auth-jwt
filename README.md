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

# Supported scenarios
This is not a mature library, as is currently, it is designed for a single scenario:  
* Allow a user to securely log in
* If the Ember app is closed and the JWT expires, that's it, the user has to log in again. Tokens are short lived (10 min), and it is desirable to have the user log in again after not if the app was closed for longer than 10 minutes.
* User should stay authenticated as long as the Ember app is open (hence the need for refresh tokens).

I realize this is a narrow use case, but it is what I needed and this gets the job done.  
If you have other scenarios; please submit a proposal / PR.

# Note: Production use
This library is hardly battle tested, use at your own risk!  
It was written out of necessity to have a simple authentication system that was easy to set up, reason about, and did not rely on 3rd party services such as [Auth0](https://auth0.com)

I am not a security expert, if you find something of concern please open an issue!
