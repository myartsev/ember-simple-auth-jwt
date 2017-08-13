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
    The identification attribute name. __This will be used in the request.__
    @property identificationAttributeName
    @type String
    @default 'username'
    @public
  */
  identificationAttributeName: 'username',

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
          console.log(jwtPayload);
          // const expiresAt = this._absolutizeExpirationTime(response['expires_in']);
          // this._scheduleAccessTokenRefresh(response['expires_in'], expiresAt, response['refresh_token']);
          // if (!isEmpty(expiresAt)) {
          //   response = assign(response, {
          //     'expires_at': expiresAt
          //   });
          // }

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
    if(jwtHeader.typ !== "JWT") {
      return false;
    }

    // Validate the JWT payload:
    // iat: issued at time
    // exp: expiration time
    let jwtPayload = JSON.parse(atob(jwtToken[1]));
    if(!jwtPayload['iat'] || !jwtPayload['exp']) {
      return false;
    }

    return true;
    // return !Ember.isEmpty(data['token']) && data['token'].split('.').length === 3;
  }
});
