import JWTAuthenticator from 'ember-simple-auth-jwt/authenticators/jwt';
import config from '../config/environment';

export default JWTAuthenticator.extend({
  serverTokenEndpoint: config.authServerTokenEndpoint,
  serverRefreshTokenEndpoint: config.authServerRefreshTokenEndpoint,
});
