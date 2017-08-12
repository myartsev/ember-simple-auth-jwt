import JWTAuthenticator from 'ember-simple-auth-jwt/authenticators/jwt';

export default {
  name: 'ember-simple-auth-jwt',
  before: 'ember-simple-auth',
  initialize(container) {
    container.register('authenticator:jwt', JWTAuthenticator);
  }
};
