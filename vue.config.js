const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.GITHUB_ACTIONS == "true"
    ? "/spotify-now-playing-overlay/"
    : "/"
})
