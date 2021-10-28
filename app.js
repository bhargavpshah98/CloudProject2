var express = require('express');
const expressLayouts=require('express-ejs-layouts');
var app = express();
var path=require("path")



app.use(expressLayouts);
app.set('view engine','ejs')
//app.set('views', path.join(__dirname, 'views'));
//app.use(express.static(path.join(__dirname, 'public')));

  
  // about page
  
  app.get('/',function(req,res){
      res.render("login")
  })



  
  app.listen(8080);
  console.log('Server is listening on port 8080');