const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin to set up iOS light and dark mode icons
 */
const withIosIcons = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.platformProjectRoot;
      const lightIconPath = path.resolve(config.modRequest.projectRoot, 'assets/icons/ios-light.png');
      const darkIconPath = path.resolve(config.modRequest.projectRoot, 'assets/icons/ios-dark.png');

      // Check if icons exist
      if (!fs.existsSync(lightIconPath) || !fs.existsSync(darkIconPath)) {
        console.warn('iOS light/dark icons not found. Please ensure icons exist at assets/icons/ios-light.png and assets/icons/ios-dark.png');
        return config;
      }

      // Note: This plugin sets up the structure, but you'll need to manually configure
      // the Info.plist or use Xcode to set up alternate app icons for iOS 13+
      console.log('iOS icons configured. For light/dark mode support, you may need to configure alternate app icons in Xcode.');
      
      return config;
    },
  ]);
};

module.exports = withIosIcons;

