const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package exports support
config.resolver.unstable_enablePackageExports = true;

// Force Metro to use the browser-compatible version of axios and other libs
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Intercept axios resolution to force the browser build
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'axios') {
        // Resolve to the browser bundle explicitly to avoid node-specific dependencies
        const axiosRoot = path.dirname(require.resolve('axios/package.json'));
        return {
            filePath: path.join(axiosRoot, 'dist/browser/axios.cjs'),
            type: 'sourceFile',
        };
    }

    // Chain to standard resolution
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
