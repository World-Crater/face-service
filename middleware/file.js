const fs = require("fs");
const { promisify } = require("util");

async function deleteUploadedFile(req, _, next) {
  await promisify(fs.unlink)(`./${req.file.path}`);
  next();
}

module.exports = {
  deleteUploadedFile,
};
