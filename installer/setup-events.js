/**
 * Squirrel.Windows Event Handlers
 * 
 * Handles Windows installer events:
 * - install
 * - update
 * - uninstall
 * - obsolete
 */

const path = require('path');
const { spawn } = require('child_process');

// Check if we're running with squirrel events
function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args, { detached: true }).on('close', () => process.exit());
  };

  const squirrelEvent = process.argv[1];
  
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Install/Update: Create shortcuts
      spawnUpdate(['--createShortcut', exeName]);
      return true;

    case '--squirrel-uninstall':
      // Uninstall: Run cleanup script
      console.log('Running uninstall cleanup...');
      
      try {
        const { performCleanup } = require('./uninstall-cleanup.js');
        performCleanup();
      } catch (error) {
        console.error('Cleanup error:', error);
      }

      // Remove shortcuts
      spawnUpdate(['--removeShortcut', exeName]);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before update
      return true;
  }

  return false;
}

module.exports = handleSquirrelEvent;

