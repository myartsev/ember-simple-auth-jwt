import {
  test
} from 'qunit';
import {
  tryInvoke
} from '@ember/utils';
import Pretender from 'pretender';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | login', {
  afterEach() {
    tryInvoke(server, 'shutdown');
  }
});

let server;

test('visiting /login', function(assert) {
  server = new Pretender(function() {
    this.post(`api/token-auth`, () => [200, {
      'Content-Type': 'application/json'
    }, '{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MDMwMTM1NDgsImV4cCI6MTUwMzAxMzU3OH0.yK6ER4txjJ7799FiAPiBREGSRCJGxFUnZCBhp1hlJNY"}']);
  });

  visit('/login');

  fillIn('#identification', 'letme');
  fillIn('#password', 'in');
  click('button');

  andThen(function() {
    assert.equal(currentURL(), '/');
  });
});
