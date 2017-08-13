import Ember from 'ember';
import RSVP from 'rsvp';
import fetch from 'fetch';
import {
  run
} from '@ember/runloop';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

export default BaseAuthenticator.extend({
  session: Ember.inject.service(),

  /**
    The endpoint on the server that the authentication request is sent to.
    @property serverTokenEndpoint
    @type String
    @default '/api/token-auth'
    @public
  */
  serverTokenEndpoint: '/api/token-auth',

  /**
    The endpoint on the server that the refresh request is sent to.
    @property serverRefreshTokenEndpoint
    @type String
    @default '/api/token-refresh'
    @public
  */
  serverRefreshTokenEndpoint: '/api/token-refresh',

  /**
    The identification attribute name. __This will be used in the request.__
    @property identificationAttributeName
    @type String
    @default 'username'
    @public
  */
  identificationAttributeName: 'username',

  /**
    The offset time in milliseconds to refresh the access token. This must
    return a random number. This randomization is needed because in case of
    multiple tabs, we need to prevent the tabs from sending refresh token
    request at the same exact moment.
    __When overriding this property, make sure to mark the overridden property
    as volatile so it will actually have a different value each time it is
    accessed.__
    @property refreshAccessTokens
    @type Integer
    @default a random number between 5 and 10
    @public
  */
  tokenRefreshOffset: Ember.computed(function() {
    const min = 5;
    const max = 10;

    return (Math.floor(Math.random() * (max - min)) + min) * 1000;
  }).volatile(),

  restore(data) {
    // TODO: call refresh-token and resolve the promise on whether the token
    // was successfully refreshed
    return RSVP.Promise.resolve();
  },

  /**
    Authenticates the session with the specified `identification` & `password`.
    Issues a `POST` request to the serverTokenEndpoint and receives the JWT token in response.

    If the credentials are valid and thus authentication succeeds, a promise that resolves with the
    server's response is returned, otherwise a promise that rejects with the error as returned by
    the server is returned.

    TODO: If the server supports it this method also schedules refresh requests for the access token before it
    expires.
    @method authenticate
    @param {String} identification The resource owner username
    @param {String} password The resource owner password
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming authenticated
    @public
  */
  authenticate(identification, password) {
    return new RSVP.Promise((resolve, reject) => {
      const data = {
        username: identification,
        password: password
      };
      const serverTokenEndpoint = this.get('serverTokenEndpoint');

      this.makeRequest(serverTokenEndpoint, data).then((response) => {
        run(() => {
          if (!this._validate(response)) {
            reject('token is missing or invalid in server response');
          }

          const jwtPayload = JSON.parse(atob(response.token.split('.')[1]));
          this._scheduleAccessTokenRefresh(response.token, jwtPayload.exp);

          resolve(response);
        });
      }, (response) => {
        run(null, reject, response.responseJSON);
      });
    });
  },

  /**
    Deletes the JWT token
    @method invalidate
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being invalidated
    @public
   */
  invalidate() {
    this.set('session.data.authenticated', {});
    return RSVP.Promise.resolve();
  },

  /**
    Makes a request to the JWT server.
    @method makeRequest
    @param {String} url The request URL
    @param {Object} data The request data
    @param {Object} headers Additional headers to send in request
    @return {Promise} A promise that resolves with the response object
    @protected
  */
  makeRequest(url, data, headers = {}) {
    headers['Content-Type'] = 'application/json';

    const options = {
      body: JSON.stringify(data),
      headers,
      method: 'POST'
    };

    return new RSVP.Promise((resolve, reject) => {
      fetch(url, options).then((response) => {
        response.text().then((text) => {
          let json = text ? JSON.parse(text) : {};
          if (!response.ok) {
            response.responseJSON = json;
            reject(response);
          } else {
            resolve(json);
          }
        });
      }).catch(reject);
    });
  },

  /**
    Validate that the response contains a valid JWT token
  */
  _validate(data) {
    // Validate that a token is present
    if (Ember.isEmpty(data['token'])) {
      return false;
    }

    let jwtToken = data['token'].split('.');

    // Validate the three elements of a JWT are present
    if (jwtToken.length !== 3) {
      return false;
    }

    // Validate the JWT headers
    let jwtHeader = JSON.parse(atob(jwtToken[0]));
    if (jwtHeader.typ !== "JWT") {
      return false;
    }

    // Validate the JWT payload:
    // iat: issued at time
    // exp: expiration time
    let jwtPayload = JSON.parse(atob(jwtToken[1]));
    if (!jwtPayload['iat'] || !jwtPayload['exp']) {
      return false;
    }

    return true;
  },

  _scheduleAccessTokenRefresh(token, expiresAt) {
    const offset = this.get('tokenRefreshOffset');
    const now = Date.now();
    const waitMs = (expiresAt * 1000) - now - offset; //expiresAt is in sec
    run.later(this, this._refreshAccessToken, token, waitMs);
  },

  _refreshAccessToken(token) {
    const data = {
      token: token
    };
    const serverRefreshTokenEndpoint = this.get('serverRefreshTokenEndpoint');

    return new RSVP.Promise((resolve, reject) => {
      this.makeRequest(serverRefreshTokenEndpoint, data).then((response) => {
        run(() => {
          if (!this._validate(response)) {
            reject('token is missing or invalid in server response');
          }

          const jwtPayload = JSON.parse(atob(response.token.split('.')[1]));
          this._scheduleAccessTokenRefresh(response.token, jwtPayload.exp);

          this.trigger('sessionDataUpdated', response);
          resolve(data);
        });
      }, (reason) => {
        Ember.warn(`Access token could not be refreshed - server responded with ${JSON.stringify(reason.responseJSON)}.`, false, {
          id: 'ember-simple-auth-jwt.failedJWTTokenRefresh'
        });
        reject();
      });
    });
  },
});
