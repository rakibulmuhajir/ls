// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = false;

module.exports = config;
/**
 * Original code by https://github.com/kimchouard/rn-skia-metro-web-example/blob/main/path-fs-canvaskit-postinstall.js
 */
