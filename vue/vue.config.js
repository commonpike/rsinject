const path = require("path");
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  lintOnSave: false,
  outputDir: path.resolve(__dirname, "demo"),
});
