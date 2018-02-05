import RSVP from 'rsvp';
import fetch from 'fetch';
import {
  run
} from '@ember/runloop';
import {
  isEmpty
} from '@ember/utils';
import {
  warn
} from '@ember/debug';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

export default BaseAuthenticator.extend({
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
    The password attribute name. __This will be used in the request.__
    @property passwordAttributeName
    @type String
    @default 'password'
    @public
  */
  passwordAttributeName: 'password',

  /**
    Time (ms) before the JWT expires to call the serverRefreshTokenEndpoint
    @property refreshTokenOffset
    @type Integer
    @default '1000'
    @public
  */
  refreshTokenOffset: 1000,

  /**
    Time (ms) after a call to serverRefreshTokenEndpoint during which no
    further refresh token calls will be made.

    Used to reduce the number of refresh token calls made when the same
    app is simultaneously open in multiple tabs/windows.

    For example: if the JWT is set to expire 30s after being issued, and the
    'refreshTokenAfter' is set at 25s, requests may only be sent out in the
    last 5 seconds.

    @property refreshTokenAfter
    @type Integer
    @default '25000'
    @public
  */
  refreshTokenAfter: 25000,

  _refreshTokenTimeout: null,

  /**
    Restores the session from a session data object; __will return a resolving
    promise when there is a non-empty `access_token` in the session data__ and
    a rejecting promise otherwise.
    @method restore
    @param {Object} data The data to restore the session from
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming or remaining authenticated
    @public
  */
  restore(data) {
    if (this._refreshTokenTimeout) {
      run.cancel(this._refreshTokenTimeout);
      delete this._refreshTokenTimeout;
    }
    return this._refreshAccessToken(data);
  },

  /**
    Authenticates the session with the specified `identification` & `password`.
    Issues a `POST` request to the serverTokenEndpoint and receives the JWT token in response.

    If the credentials are valid and thus authentication succeeds, a promise that resolves with the
    server's response is returned, otherwise a promise that rejects with the error as returned by
    the server is returned.

    This method also schedules refresh requests for the access token before it expires.
    TODO: make the refresh token support optional
    @method authenticate
    @param {String} identification The resource owner username
    @param {String} password The resource owner password
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming authenticated
    @public
  */
  authenticate(identification, password) {
    return new RSVP.Promise((resolve, reject) => {
      const {
        identificationAttributeName,
        passwordAttributeName
      } = this.getProperties('identificationAttributeName', 'passwordAttributeName');
      const data = {
        [identificationAttributeName]: identification,
        [passwordAttributeName]: password
      };
      const serverTokenEndpoint = this.get('serverTokenEndpoint');

      this.makeRequest(serverTokenEndpoint, data)
        .then((response) => {
          return this._validateTokenAndScheduleRefresh(response);
        })
        .then((response) => {
          run(() => {
            resolve(response);
          });
        })
        .catch((reason) => {
          if (reason.responseJSON) {
            reason = reason.responseJSON;
          }
          run(null, reject, reason);
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
    run.cancel(this._refreshTokenTimeout);
    delete this._refreshTokenTimeout;
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
            window.localStorage.setItem('jwtLastRefreshAt', Date.now());
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
    if (isEmpty(data['token'])) {
      return false;
    }

    let jwtToken = data['token'].split('.');

    // Validate the three elements of a JWT are present
    if (jwtToken.length !== 3) {
      return false;
    }

    // Validate the JWT header
    let jwtHeader = JSON.parse(atob(jwtToken[0]));
    if (!jwtHeader.alg) {
      return false;
    }

    // Validate the JWT payload:
    // iat: issued at time
    // exp: expiration time
    let jwtPayload = JSON.parse(atob(jwtToken[1]));
    if (isNaN(jwtPayload['iat']) || isNaN(jwtPayload['exp'])) {
      return false;
    }

    return true;
  },

  _scheduleTokenRefresh(data) {
    const jwtPayload = JSON.parse(atob(data.token.split('.')[1]));
    const jwtPayloadExpiresAt = jwtPayload.exp;

    const offset = 1000; // Refresh 1 sec before JWT expires
    const now = Date.now();
    const waitMs = (jwtPayloadExpiresAt * 1000) - now - offset; //expiresAt is in sec

    if (this._refreshTokenTimeout) {
      run.cancel(this._refreshTokenTimeout);
      delete this._refreshTokenTimeout;
    }

    // Reschedule if the JWT is still valid
    if (waitMs > 0) {
      this._refreshTokenTimeout = run.later(this, this._refreshAccessToken, data, waitMs);
    }
  },

  _refreshAccessToken(data) {
    var timeElapsedSinceLastRefresh = Date.now() - window.localStorage.getItem('jwtLastRefreshAt')
    if (timeElapsedSinceLastRefresh <= this.get('refreshTokenAfter')) {
      // Request attempted too soon! Reschedule
      return this._validateTokenAndScheduleRefresh(data);
    }

    const serverRefreshTokenEndpoint = this.get('serverRefreshTokenEndpoint');

    return new RSVP.Promise((resolve, reject) => {
      this.makeRequest(serverRefreshTokenEndpoint, data)
        .then((response) => {
          return this._validateTokenAndScheduleRefresh(response);
        })
        .then((response) => {
          run(() => {
            this.trigger('sessionDataUpdated', response);
            resolve(response);
          });
        })
        .catch((reason) => {
          if (reason.responseJSON) {
            reason = JSON.stringify(reason.responseJSON);
          }
          warn(`JWT token could not be refreshed: ${reason}.`, false, {
            id: 'ember-simple-auth-jwt.failedJWTTokenRefresh'
          });

          reject();
        });
    });
  },

  _validateTokenAndScheduleRefresh(response) {
    if (!this._validate(response)) {
      return RSVP.Promise.reject('token is missing or invalid in server response');
    }

    this._scheduleTokenRefresh(response);
    return RSVP.Promise.resolve(response);
  }
});
