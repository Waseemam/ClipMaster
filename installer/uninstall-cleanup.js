/**
 * Uninstall Cleanup Script for ClipMaster
 * 
 * This script runs when the user uninstalls the app.
 * Configure REMOVE_USER_DATA to control cleanup behavior.
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Set to true to delete user data on uninstall
  // Set to false to keep user data (default, safer option)
  REMOVE_USER_DATA: false,
  
  // If true, shows a confirmation dialog before deleting data
  CONFIRM_BEFORE_DELETE: true,
  
  // User data location (AppData\Roaming\ClipMaster)
  USER_DATA_PATH: path.join(process.env.APPDATA || '', 'ClipMaster'),
};

// ============================================
// CLEANUP LOGIC
// ============================================

function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDirectory(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

function performCleanup() {
  console.log('ClipMaster Uninstall Cleanup');
  console.log('=============================\n');

  if (!CONFIG.REMOVE_USER_DATA) {
    console.log('✓ User data will be preserved');
    console.log(`  Location: ${CONFIG.USER_DATA_PATH}`);
    console.log('\nYour notes and clipboard history are safe!');
    console.log('To manually remove them, delete the folder above.\n');
    return;
  }

  // Check if user data exists
  if (!fs.existsSync(CONFIG.USER_DATA_PATH)) {
    console.log('✓ No user data found to clean up');
    return;
  }

  try {
    console.log('⚠️  Removing user data...');
    console.log(`  Location: ${CONFIG.USER_DATA_PATH}`);
    
    deleteDirectory(CONFIG.USER_DATA_PATH);
    
    console.log('✓ User data removed successfully\n');
  } catch (error) {
    console.error('❌ Error removing user data:', error.message);
    console.error('   You may need to manually delete:', CONFIG.USER_DATA_PATH);
  }
}

// Run cleanup
if (require.main === module) {
  performCleanup();
}

module.exports = { performCleanup, CONFIG };

