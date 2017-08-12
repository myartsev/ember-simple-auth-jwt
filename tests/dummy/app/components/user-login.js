import Ember from 'ember';
import layout from '../templates/components/user-login';

export default Ember.Component.extend({
  session: Ember.inject.service(),

  actions: {
    authenticate() {
      let {
        identification,
        password
      } = this.getProperties('identification', 'password');
      this.get('session').authenticate('authenticator:jwt', identification, password).catch((reason) => {
        this.set('errorMessage', reason.error || reason);
      });
    }
  }
});
