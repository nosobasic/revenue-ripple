// Patched CA bundles required by https://render.com/docs/advisory-emudhra.
export function assertPatchedNode(version) {
  const parts = version.split('.').map(Number);
  const minimum = { 22: [23, 4], 24: [22, 1], 26: [12, 1] }[parts[0]];
  if (!minimum || parts[1] < minimum[0] || (parts[1] === minimum[0] && parts[2] < minimum[1])) {
    throw new Error(`Node ${version} is not an approved patched runtime. Use 22.23.4+, 24.22.1+, or 26.12.1+ within those majors.`);
  }
}
assertPatchedNode(process.versions.node);
console.log(`Verified patched build runtime: Node ${process.versions.node}`);
