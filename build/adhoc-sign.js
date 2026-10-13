// Unsigned beta builds: ad-hoc sign the Mac app so Apple Silicon shows "unidentified developer"
// (right-click › Open works) instead of "Spring is damaged". Replace with a Developer ID later.
const { execFileSync } = require('child_process');
const path = require('path');
exports.default = async (ctx) => {
  if (ctx.electronPlatformName !== 'darwin') return;
  const app = path.join(ctx.appOutDir, `${ctx.packager.appInfo.productFilename}.app`);
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
};
