// Remotion config for the White Cloaks remake.
// Browser: reuse the Playwright Chrome Headless Shell already on this machine
// (~/.cache/ms-playwright/chromium_headless_shell-1194) when it exists.
// The full Chromium build (chromium-1194/chrome) FAILS under Remotion 4.0.545
// because it is launched with old headless mode, which Chrome 141 removed;
// the headless shell is the standalone implementation of old headless and works.
// On machines without that binary (e.g. GitHub runners) the executable is NOT
// forced, so Remotion falls back to its own installed browser — run
// `npx remotion browser install chrome` there first.
import { Config } from '@remotion/cli/config';
import { existsSync } from 'node:fs';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
const LOCAL_SHELL = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (existsSync(LOCAL_SHELL)) {
  Config.setBrowserExecutable(LOCAL_SHELL);
}
Config.setChromiumOpenGlRenderer('swiftshader');
