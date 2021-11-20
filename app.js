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

require("dotenv").config();
AWS.config.update({
  accessKeyId: process.env["ACCESS_KEY_ID"],
  secretAccessKey: process.env["SECRET_ACCESS_KEY"],
  region: process.env["AWS_REGION"] 
});

//app.use(bodyParser.urlencoded({ extended: false }))
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
  
app.use("/",users);
  app.listen(3000);
  console.log('Server is listening on port 3000');

  app.get ("/welcome", function (req,res) {
    res.render ( "welcome.ejs" );	
    } );
  app.get ("/loggedin", function (req,res) {
    res.render ( "loggedin.ejs" );	
    } );


    //register
    app.post("/register",function(req,res){
      const { name, email, password, confirm,userType} = req.body;
         console.log("name",name,email,confirm,password,userType,typeof(userType))
      var attributeList = [];
       attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value:name}));
       attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"gender",Value:"female"}));
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:email}));
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"custom:userType",Value:userType}))
  pool.signUp(email,password,attributeList,null,function(err,result){
    if (err) {
      console.log("error",err);
      if(err=="UsernameExistsException: An account with the given email already exists."){
        res.status(403).send({message:"User exists already"})
      }
      else{
      res.status(500).send({message:"Internal error"})
      }
      //return;
  }
  else{
  console.log("Result",result)
  cognitoUser = result.user;
  console.log('user name is ' + cognitoUser.getUsername());
  
  res.status(200).send({message:"Success"})
  insertUserToDb(req,res);
  }
  
  
  //insertUtility.insertDocToDb("req","res")


  function insertUserToDb(req,res) {

      const db = new AWS.DynamoDB();
      const dbInput = {
          TableName: process.env["DYNAMODB_TABLE_USER"],
             Item: {
               Name: { S: req.body.name },
               email: { S: req.body.email },
               userType: { S: req.body.userType },
               gender: {S: req.body.gender}
             },
           };
           db.putItem(dbInput, function (putErr, putRes) {
             if (putErr) {
               console.log("Failed to put item in dynamodb: ", putErr);
               res.status(404).json({
                 err: "Failed to Upload!",
               });
             } else {
               console.log("Successfully written to dynamodb", putRes);
             }
           });
        }
 

 });
});


//verify
app.post('/verifyuser',function(req,res){
  console.log("res into verify",req.body)
  const otp=req.body.otp
 const userData={
   Username:req.body.email,
   Pool:pool
 }
 const cognitoUser=new AmazonCognitoIdentity.CognitoUser(userData);
 cognitoUser.confirmRegistration(otp,true,function(error,results){
   if(error){
     console.log("error",error)
   }
   console.log("results from verify",results)
 })

})
//login
app.post("/login",async(req,res)=>{
  console.log("login",req.body)
 const authentication_details=new AmazonCognitoIdentity.AuthenticationDetails(
   {
    Username: req.body.email,
    Password: req.body.password
   }
 )
var userData = {
  Username : req.body.email,
  Pool : pool
};
var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)
cognitoUser.authenticateUser(authentication_details, {
  onSuccess: function (result) {
    console.log("user",result.getIdToken().getJwtToken())
    var token = result.getIdToken().getJwtToken();
var decoded = decodeJwt(token);
console.log("Decoded",decoded)
    
  
   
      res.send({message:"Success",token:result.getIdToken().getJwtToken(),data:decoded})
  },
  onFailure: function(err) {
      console.log("error in onfailure",err);
      if(err=="NotAuthorizedException: Incorrect username or password."){
        res.status(404).send({message:"User does not exist"})
      }
      else{
      res.status(200).json({message:"Incorrect Password"})
      }
      //res.sendStatus(500).send({"message":"Internal error"})
  },

});


});
app.get("/dashboard",function(req,res){
  res.render("dashboard")
})
//
// app.get(`/verifycode`,function(req,res){;
//    console.log("verify render",req.params)
//   // const name=req.params
//   //res.render("verify",{name:"abc"})
//   res.render("verify")
//  //res.render("login")
// })



  
       

  