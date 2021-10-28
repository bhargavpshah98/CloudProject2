var express = require('express');
var app = express();
app.set('view engine','ejs')

  
  // about page
  app.get('/', function(req, res) {
    //res.render('Hello');
    res.send("hh")
  });
  
  app.listen(8080);
  console.log('Server is listening on port 8080');