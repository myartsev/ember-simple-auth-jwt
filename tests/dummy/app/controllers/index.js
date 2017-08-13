import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),
  sessionData: Ember.computed('session.data.authenticated', function() {
    return JSON.stringify(this.get('session.data.authenticated'));
  }),

  actions: {
    invalidateSession() {
      this.get('session').invalidate();
    }
  }
});
