import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authorizers/base';

export default BaseAuthenticator.extend({
  restore(data) {
    console.log(`Restore: ${data}`);
  },

  authenticate(identification, password) {
    console.log(`Authenticate: ${identification} - ${password}`);
  },

  invalidate() {
    console.log(`Invalidate: ${data}`);
  }
});
