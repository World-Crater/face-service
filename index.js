require("dotenv").config();
const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());

app.use((req, res, next) => {
  console.log("get request: ", JSON.stringify(req.body));
  next();
});

app.use("/faces", require("./route/face"));

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
});
