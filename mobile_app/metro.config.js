const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package exports support
config.resolver.unstable_enablePackageExports = true;

// Prioritize "browser" condition in "exports" field
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

// Prioritize "browser" / "react-native" in main fields
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
