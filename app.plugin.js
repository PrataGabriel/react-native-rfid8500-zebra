/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('@expo/config-plugins')} */
const {
  withAppBuildGradle,
  withPlugins,
  createRunOncePlugin,
} = require('@expo/config-plugins');

/** @type {import('@expo/config-plugins').ConfigPlugin} */
const configureAppBuildGradle = (cfg) =>
  withAppBuildGradle(cfg, (config) => {
    const {
      modResults: { contents },
    } = config;

    const [before, after] = contents.split('dependencies');
    const flatDir =
      'implementation fileTree(dir: "../../node_modules/react-native-rfid8500-zebra/android/libs", include: ["*.aar", "*.jar"], exclude: [])';
    const newAfter = after.includes(flatDir)
      ? after
      : after.replace(/\W?{/, ` {\n    ${flatDir}\n`);

    config.modResults.contents = before + 'dependencies' + newAfter;

    return config;
  });

const pkg = require('./package.json');

/** @type {import('@expo/config-plugins').ConfigPlugin} */
const plugins = (config) => {
  return withPlugins(config, [configureAppBuildGradle]);
};

module.exports = createRunOncePlugin(plugins, pkg.name, pkg.version);
