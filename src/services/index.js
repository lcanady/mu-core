const { readdirSync } = require("fs");
const { resolve } = require("path");

module.exports = (mu) => {
  path = resolve(__dirname, "./lib");
  const dir = readdirSync(path, { withFileTypes: true });
  for (const dirent of dir) {
    if (dirent.isFile() && dirent.name.endsWith(".js")) {
      require("./lib/" + dirent.name)(mu);
    }
  }
};
