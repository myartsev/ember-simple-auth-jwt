import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  session: inject(),

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
