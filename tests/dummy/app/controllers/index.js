import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),
  sessionData: Ember.computed('session.data.authenticated', function() {
    return JSON.stringify(this.get('session.data'));
  }),

  jwtToken: Ember.computed('session.data.authenticated', function() {
    let token = this.get('session.data.authenticated.token');
    if (Ember.isEmpty(token)) {
      return token;
    }

    return this.get('session.data.authenticated.token').split('.');
  }),

  jwtHeader: Ember.computed('jwtToken', function() {
    let token = this.get('jwtToken');
    return Ember.isEmpty(token) ? '' : atob(token[0]);
  }),

  jwtPayload: Ember.computed('jwtToken', function() {
    let token = this.get('jwtToken');
    return Ember.isEmpty(token) ? '' : atob(token[1]);
  }),

  jwtSignature: Ember.computed('jwtToken', function() {
    let token = this.get('jwtToken');
    return Ember.isEmpty(token) ? '' : token[2];
  }),
});
