var express = require('express');
const expressLayouts=require('express-ejs-layouts');
var app = express();
var uuid = require('uuid');
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
const formtopdf = require('./utilities/formtopdf')
const fs=require("fs")
var PDFDocument = require('pdfkit');
const { Console } = require('console');


require("dotenv").config();
AWS.config.update({
  accessKeyId: process.env["ACCESS_KEY_ID"],
  secretAccessKey: process.env["SECRET_ACCESS_KEY"],
  region: process.env["AWS_REGION"] 
});

var scheduleHandler = require("./routes/medSchedule");

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
app.use("/medSchedule",scheduleHandler);

module.exports = app;

app.use("/",users);
  app.listen(3000);
  console.log('Server is listening on port 3000');

app.get('/dashboard',function(req,res){
    res.render("dashboard")
})

app.get('/prescription',function(req,res){
  res.render("prescription")
})

app.get('/addprescription',function(req,res){
  console.log(formtopdf)
  res.render("addprescription", {
    utils: formtopdf
  })
})



  app.get ("/welcome", function (req,res) {
    res.render ( "welcome.ejs" );	
    } )

  app.get("/medSchedule", function (req,res) {
    console.log("process",  process.env["DYNAMODB_TABLE_FORM"]);		
        })

  app.get ("/loggedin", function (req,res) {
    res.render ( "loggedin.ejs" );	
    } )
    app.get ("/sample", function (req,res) {
      res.render ( "sample.ejs" );	
      } )


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
   
    var token = result.getIdToken().getJwtToken();
var decoded = decodeJwt(token);

res.send({message:"Success",token:result.getIdToken().getJwtToken(),data:decoded})
//res.redirect("/dashboard")
  },
  onFailure: function(err) {
      console.log("error in onfailure",err);
      if(err=="NotAuthorizedException: Incorrect username or password."){
        res.status(404).send({message:"User does not exist"})
      }
      else{
        if(err=="UserNotConfirmedException: User is not confirmed."){
          res.status(200).json({message:"User not confirmed"})
        }
      res.status(200).json({message:"Incorrect Password"})
      }
      //res.sendStatus(500).send({"message":"Internal error"})
  },

});
});

app.get("/dashboardview",async(req,res)=>{
  console.log("Request query",req.query)
 if(req.query.userType=="Doctor"){
   console.log("doctoe")
  const response= await getPatients()
  const results=response.Items
  console.log("results",results)
  res.render("dashboard",{data:results})

 }
 else{
  res.render("dashboard",{data:[]})
 }
})

app.get("/prescriptionview",async(req,res)=>{
  console.log("Prescription Request query",req.query)
  const response= await getPatientPrescriptions(req.query.email)
  const results=response.Items
  console.log("results",results)
  res.render("prescription",{data:results})

 })
 
function getPatientPrescriptions(req, res){
  return new Promise((resolve,reject)=>{

  const db = new AWS.DynamoDB();
   let scanningParam={
     //KeyConditionExpression: 'patientEmail =: patientEmail',
     //ExpressionAttributeNames: {"#PE": "PatientEmail"},
     //ProjectionExpression : "#PE",
     TableName:process.env["DYNAMODB_TABLE_PRESCRIPTION"], 
   }
    db.scan(scanningParam,function(err,data){
     if(err){
       console.log("err",err)
       reject(err)
     }
     else{
       //console.log("data",data)
       resolve(data)
     }
   })
  })
}

function getPatients(req,res) {
  console.log("getpatient function")
  return new Promise((resolve,reject)=>{

  const db = new AWS.DynamoDB();
 let scanningParam={
   TableName:process.env["DYNAMODB_TABLE_USER"],
   
 }
  db.scan(scanningParam,function(err,data){
   if(err){
     console.log("err",err)
     reject(err)
   }
   else{
     //console.log("data",data)
     resolve(data)
   }
 })
})
}
app.post("/pdf",async(req,res)=>{
  const s3=new AWS.S3();
  console.log("req,para",req.body)
 const response= await formtopdf.createpdf(req.body);
 console.log("Res",response)
 //PDFDocument.pipe(fs.createWriteStream(response));
//PDFDocument.end();
 
  fs.readFile(response, function (err, data) {
    if (err) {
      console.log(err);
    }
    s3.upload({
      Bucket: "prescriptionmanager",
      Key: response,
      Body: data,
      ContentType:'application/pdf',
      ACL:'public-read'
      
    }, function(err, dataD) {
      if (err) {
        console.log(err);
      }
      console.log("DATA FROM S3",dataD)
      //res.status(200).send({"message":"Success"})
      const db = new AWS.DynamoDB();
      const dbInput = {
            TableName: process.env["DYNAMODB_TABLE_PRESCRIPTION"],
            Item: {
              Id: { S: uuid.v1() },
              patientName: { S: req.body.name },
              prescriptionName: {S: req.body.prescription},
              medicine: {S: req.body.medicine},
              //patientEmail: { S: req.body.patientEmail},
              startDate: { S: req.body.sdate },
              endDate: { S: req.body.edate },
              morningCount: { N: req.body.morning },
              middayCount: { N: req.body.midday },
              eveningCount: {N: req.body.evening},
              bedtimeCount: {N: req.body.bedtime},
              cloudfrontKey: { S: dataD.key },
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
              res.status(200).json({
                message: "Upload is successful!",
              });
            }
          });
    });
  });
})



app.use('/delete',require('./routes/prescription-delete'));




