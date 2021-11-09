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
app.use(express.static(path.join(__dirname, 'views')));

  
  // about page
  
app.use("/",users);
  app.listen(3000);
  console.log('Server is listening on port 3000');

  app.get ("/welcome", function (req,res) {
    res.render ( "welcome.ejs" );	
    } );
  app.get ("/loggedin", function (req,res) {
    res.render ( "loggedin.ejs" );	
    } );