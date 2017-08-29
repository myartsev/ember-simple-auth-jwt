import {
  test
} from 'qunit';
import Pretender from 'pretender';
import {
  authenticateSession
} from '../../tests/helpers/ember-simple-auth';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | protected');

const valid_dummy_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MDMwMTM1NDgsImV4cCI6MTUwMzAxMzU3OH0.yK6ER4txjJ7799FiAPiBREGSRCJGxFUnZCBhp1hlJNY";

test('visiting a protected page while un-authenticated redirects to login page', function(assert) {
  visit('/secret');

  andThen(function() {
    assert.equal(currentURL(), '/login');
  });
});

test('can visit a protected page while authenticated', function(assert) {
  authenticateSession(this.application, {
    token: valid_dummy_token
  });

  new Pretender(function() {
    this.get('/api/secret-stuff', () => [200, 'hi?']);
  });

  visit('/secret');

  andThen(function() {
    assert.equal(currentURL(), '/secret');
  });
});
