import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPatchedNode } from '../../scripts/verify-node-runtime.mjs';

test('build runtime gate accepts patched supported branches and rejects earlier CA bundles', () => {
  for (const version of ['22.23.4', '22.24.0', '24.22.1', '26.12.1']) {
    assert.doesNotThrow(() => assertPatchedNode(version));
  }
  for (const version of ['20.20.0', '22.14.0', '22.23.3', '24.22.0', '26.12.0', '25.9.0']) {
    assert.throws(() => assertPatchedNode(version), /not an approved patched runtime/);
  }
});
