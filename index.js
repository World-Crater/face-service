const express = require('express');

const PORT = process.env.PORT || 5000

const app = express();

app.use('/faces',
  require('./route/face')
)

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
});