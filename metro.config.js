const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver for asset registry
config.resolver.assetExts.push('ttf');

module.exports = config;