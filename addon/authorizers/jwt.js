import {
  isEmpty
} from '@ember/utils';
import Base from 'ember-simple-auth/authorizers/base';

/**
  Authorizer that works with token-based authentication like JWT
  by sending the `token` properties from the session in the `Authorization` header.
  _The factory for this authorizer is registered as
  `'authorizer:token'` in Ember's container._
  @class Token
  @namespace SimpleAuth.Authorizers
  @module ember-simple-auth-token/authorizers/token
  @extends Base
*/
export default Base.extend({
  /**
    The token attribute name.
    @property tokenAttributeName
    @type String
    @default 'token'
    @public
  */
  tokenAttributeName: 'token',

  /**
    Authorizes an XHR request by sending the `token`
    properties from the session in the `Authorization` header:
    ```
    Authorization: Bearer <token>
    ```
    @method authorize
    @param {object} data
    @param {function} block
  */
  authorize(data = {}, block = () => {}) {
    if (!isEmpty(data) && !isEmpty(data.token)) {
      block('Authorization', `Bearer ${data.token}`);
    }
  }
});
