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
let users=require("./routes/users")
//app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(express.json())
app.use(expressLayouts);
//app.use(express.bof)
app.set('view engine','ejs')
//app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));
const poolData = {    
  UserPoolId : "", // Your user pool id here    
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
    app.post("/register",function(req,res,next){
      const { name, email, password, confirm,} = req.body;
         console.log("name",name,email,confirm,password)
      var attributeList = [];
      //  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value:name}));
      //  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"gender",Value:"female"}));
      //   attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:email}));
  // pool.signUp(email,password,attributeList,null,function(err,result){
  //   if (err) {
  //     console.log(err);
  //     res.status(500).send({message:"Internal error"})
  //     //return;
  // }
  // console.log("Result",result)
  // cognitoUser = result.user;
  // console.log('user name is ' + cognitoUser.getUsername());
  //res.redirect(`/verify/${cognitoUser.getUsername()}`)
  //res.status(200).json({message:"Successfull",data:"abc"})
  //res.redirect("/")
  
  //res.redirect("http://google.com/")
  //res.render("verify")
  res.redirect("/verify")
 

// });
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
app.post("/login",function(req,res){
  console.log("login")
 const authentication_details=new AmazonCognitoIdentity.AuthenticationDetails(
   {
    Username: "shruthisrinivasan97@gmail.com",
    Password: "Qwerty@1234"
   }
 )
var userData = {
  Username : 'shruthisrinivasan98@gmail.com',
  Pool : pool
};
var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)
cognitoUser.authenticateUser(authentication_details, {
  onSuccess: function (result) {
      console.log('access token + ' + result.getAccessToken().getJwtToken());
      console.log('id token + ' + result.getIdToken().getJwtToken());
      console.log('refresh token + ' + result.getRefreshToken().getToken());
  },
  onFailure: function(err) {
      console.log(err);
  },

});


});
//
app.get(`/verify`,function(req,res){;
   console.log("verify render",req.params)
  // const name=req.params
  //res.render("verify",{name:"abc"})
  res.render("verify")
 //res.render("login")
})



  
       

  