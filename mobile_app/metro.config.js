const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package exports support
config.resolver.unstable_enablePackageExports = true;

// Force Metro to use the browser-compatible version of axios and other libs
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
