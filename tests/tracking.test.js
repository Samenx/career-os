import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trackingStatus, statusFields } from '../src/services/tracking.js';
test('legacy responses merge into preliminary stages without replacing later stages', () => {
  assert.equal(trackingStatus({status: 'Applied', response: 'Accepted'}), 'Accepted');
  assert.equal(trackingStatus({status: 'Technical Interview', response: 'Responded'}), 'Technical Interview');
  assert.equal(trackingStatus({application_status: 'Rejected', response: 'Rejected', latest_status: 'Applied', latest_response: null}, true), 'Applied');
});
test('one status selection maps to compatible stored fields', () => {
  assert.deepEqual(statusFields('Responded', true), { application_status: 'Applied', response: 'Responded' });
  assert.deepEqual(statusFields('Rejected'), { status: 'Rejected', response: 'Rejected' });
  assert.deepEqual(statusFields('Applied'), { status: 'Applied', response: 'No Response' });
});
