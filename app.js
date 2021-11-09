var express = require('express');
const expressLayouts=require('express-ejs-layouts');
var app = express();
var bodyParser=require("body-parser")
var path=require("path")
let users=require("./routes/users")
//app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(express.json())




app.use(expressLayouts);
//app.use(express.bof)
app.set('view engine','ejs')
//app.set('views', path.join(__dirname, 'views'));
//app.use(express.static(path.join(__dirname, 'public')));

  
  // about page
  
app.use("/",users)
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json({ type: 'application/*+json' }));




  
  app.listen(8080);
  console.log('Server is listening on port 8080');