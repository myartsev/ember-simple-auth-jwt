import {
  test
} from 'qunit';
import {
  tryInvoke
} from '@ember/utils';
import Pretender from 'pretender';
import {
  currentSession
} from '../../tests/helpers/ember-simple-auth';
import config from '../../config/environment';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | login', {
  afterEach() {
    tryInvoke(server, 'shutdown');
  }
});

let server;
const valid_dummy_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MDMwMTM1NDgsImV4cCI6MTUwMzAxMzU3OH0.yK6ER4txjJ7799FiAPiBREGSRCJGxFUnZCBhp1hlJNY";

function tokenAuthSuccessResponse() {
  server = new Pretender(function() {
    this.post(config.authServerTokenEndpoint, () => [200, {
      'Content-Type': 'application/json'
    }, `{"token":"${valid_dummy_token}"}`]);
  });
}

test('valid credentials successfully login', function(assert) {
  let self = this;
  tokenAuthSuccessResponse();

  visit('/login');
  assert.equal(currentSession(self.application).session.isAuthenticated, false);

  fillIn('#identification', 'letme');
  fillIn('#password', 'in');
  click('button');

  andThen(function() {
    assert.equal(currentURL(), '/');
    assert.equal(currentSession(self.application).session.isAuthenticated, true);
  });
});

test('login route cannot be accessed once authenticated', function(assert) {
  let self = this;
  tokenAuthSuccessResponse();

  visit('/login');
  assert.equal(currentSession(self.application).session.isAuthenticated, false);

  fillIn('#identification', 'letme');
  fillIn('#password', 'in');
  click('button');

  andThen(function() {
    assert.equal(currentURL(), '/');
    assert.equal(currentSession(self.application).session.isAuthenticated, true);

    visit('/login');
    assert.equal(currentURL(), '/');
  });
});

test('invalid credentials fail to login', function(assert) {
  let self = this;

  server = new Pretender(function() {
    this.post(config.authServerTokenEndpoint, () => [401, {
      error: 'Invalid credentials'
    }]);
  });

  visit('/login');
  assert.equal(currentSession(self.application).session.isAuthenticated, false);

  fillIn('#identification', 'not');
  fillIn('#password', 'valid');
  click('button');

  andThen(function() {
    assert.equal(currentURL(), '/login');
    assert.equal(currentSession(self.application).session.isAuthenticated, false);
  });
});
