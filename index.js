const express = require('express');

const app = express();

app.use('/faces',
  require('./route/face')
)

app.listen(5000, function () {
  console.log('App listening on port 5000!');
});