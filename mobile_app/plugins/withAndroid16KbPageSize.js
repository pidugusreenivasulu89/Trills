const { withGradleProperties, withProjectBuildGradle } = require('@expo/config-plugins');

const NDK_VERSION = '28.0.13004108';

function setGradleProperty(properties, key, value) {
  const existing = properties.find((item) => item.type === 'property' && item.key === key);

  if (existing) {
    existing.value = value;
    return properties;
  }

  properties.push({ type: 'property', key, value });
  return properties;
}

module.exports = function withAndroid16KbPageSize(config) {
  config = withGradleProperties(config, (config) => {
    config.modResults = setGradleProperty(config.modResults, 'android.ndkVersion', NDK_VERSION);
    config.modResults = setGradleProperty(config.modResults, 'expo.useLegacyPackaging', 'false');
    return config;
  });

  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      return config;
    }

    const contents = config.modResults.contents;
    config.modResults.contents = contents.replace(
      /ndkVersion\s*=\s*(?:findProperty\('android\.ndkVersion'\)\s*\?:\s*)?['"][^'"]+['"]/,
      `ndkVersion = findProperty('android.ndkVersion') ?: '${NDK_VERSION}'`
    );

    return config;
  });

  return config;
};
