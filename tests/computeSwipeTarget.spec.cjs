const assert = require('node:assert/strict');
const { test } = require('node:test');

// Import from built CJS dist of package to verify package entrypoints
const lib = require('../packages/spark-slider/dist/cjs');

test('computeSwipeTarget: below threshold returns null', () => {
  const fn = lib.computeSwipeTarget;
  assert.equal(fn(0, 0, 5), null);
  assert.equal(fn(10, 0, 5), null);
  assert.equal(fn(-10, 0, 5), null);
});

test('computeSwipeTarget: above threshold navigates and wraps', () => {
  const fn = lib.computeSwipeTarget;
  // Drag right (>0) goes to prev; wrap from 0 -> last
  assert.equal(fn(60, 0, 5), 4);
  // Drag left (<0) goes to next; wrap from last -> 0 via baseIndex=4
  assert.equal(fn(-60, 4, 5), 0);
});
