var express = require('express');
const expressLayouts=require('express-ejs-layouts');
var app = express();
var path=require("path")
let users=require("./routes/users")





app.use(expressLayouts);
app.set('view engine','ejs')
//app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));

  
  // about page

app.use("/",users);
  app.listen(3000);
  console.log('Server is listening on port 3000');


  app.get('/dashboard',function(req,res){
    res.render("dashboard")
})

app.get('/prescription-upload',function(req,res){
  res.render("prescription-upload")
})

app.get('/prescription-download',function(req,res){
  res.render("prescription-download")
})


  app.get ("/welcome", function (req,res) {
    res.render ( "welcome.ejs" );	
    } );
  app.get ("/loggedin", function (req,res) {
    res.render ( "loggedin.ejs" );	
    } );