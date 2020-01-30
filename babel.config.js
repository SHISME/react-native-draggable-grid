module.exports = {
  "presets": [
    "@babel/preset-env",
    "@babel/preset-typescript",
    '@babel/preset-react',
    "module:metro-react-native-babel-preset"
  ],
  "plugins": ["@babel/plugin-proposal-class-properties"],
  "retainLines": true,
  "sourceMaps": true
}