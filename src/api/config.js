const yml = require("yaml");
const { readFileSync } = require("fs");
const { resolve } = require("path");

const file = readFileSync(resolve(__dirname, "../../config/config.yml"), {
  encoding: "utf-8",
});

module.exports = yml.parse(file);
