const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  resolver: {
    sourceExts: [...defaultConfig.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'],
    assetExts: [...defaultConfig.resolver.assetExts, 'png', 'jpg', 'jpeg', 'svg'],
  },
};