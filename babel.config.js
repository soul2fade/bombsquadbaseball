module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      './babel-plugins/replace-import-meta-env',
      'react-native-worklets/plugin',
    ],
  };
};
