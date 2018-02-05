import Controller from '@ember/controller';
import {
  inject
} from '@ember/service';
import {
  computed
} from '@ember/object';
import {
  isEmpty
} from '@ember/utils';

export default Controller.extend({
  session: inject(),
  sessionData: computed('session.data.authenticated', function() {
    return JSON.stringify(this.get('session.data'));
  }),

  jwtToken: computed('session.data.authenticated', function() {
    let token = this.get('session.data.authenticated.token');
    if (isEmpty(token)) {
      return token;
    }

    return this.get('session.data.authenticated.token').split('.');
  }),

  jwtHeader: computed('jwtToken', function() {
    let token = this.get('jwtToken');
    return isEmpty(token) ? '' : atob(token[0]);
  }),

  jwtPayload: computed('jwtToken', function() {
    let token = this.get('jwtToken');
    return isEmpty(token) ? '' : atob(token[1]);
  }),

  jwtSignature: computed('jwtToken', function() {
    let token = this.get('jwtToken');
    return isEmpty(token) ? '' : token[2];
  }),
});
