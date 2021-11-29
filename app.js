var express = require('express');
const expressLayouts=require('express-ejs-layouts');
var app = express();
var bodyParser=require("body-parser")
var path=require("path")
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const insertUtility=require("./utilities/doctor")
let users=require("./routes/users");
const { use } = require('./routes/users');
const decodeJwt=require("jwt-decode")
var PDFDocument = require('pdfkit');
const { Console } = require('console');
let email=require("./routes/emailnotifier");
const formtopdf=require("./utilities/formtopdf")

require("dotenv").config();
AWS.config.update({
  accessKeyId: process.env["ACCESS_KEY_ID"],
  secretAccessKey: process.env["SECRET_ACCESS_KEY"],
  region: process.env["AWS_REGION"] 
});

var scheduleHandler = require("./routes/medSchedule");

app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(express.json())
app.use(expressLayouts);
//app.use(express.bof)
app.set('view engine','ejs')
//app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));
const poolData = {    
  UserPoolId : "us-west-1_x1klxacrm", // Your user pool id here    
  ClientId : "5nbvps4hlmh0a66mb4k771ns6f" // Your client id here
  }; 
  const pool_region = 'us-east-1';
  const pool=new AmazonCognitoIdentity.CognitoUserPool(poolData)

  
  // about page
app.use("/medSchedule",scheduleHandler);

module.exports = app;

//app.use("/",users);
  app.listen(3000);
  console.log('Server is listening on port 3000');





app.get('/addprescription',function(req,res){
  console.log(formtopdf)
  res.render("addprescription", {
    utils: formtopdf,
    email: req.query.email
  })
})

 

app.get("/schedule",function(req,res){
  res.render("schedule")
})


app.use('/prescriptiondelete',require('./routes/prescriptiondelete'));
app.use('/prescriptionview',require('./routes/prescriptionview'));
app.use('/prescriptionupload',require('./routes/prescriptionupload'));
app.use('/register',require('./routes/registration'))
app.use('/login',require("./routes/login"))
app.use('/dashboard',require("./routes/dashboard"))
//app.use("/schedule",require("./routes/medSchedule"))
module.exports = app;

