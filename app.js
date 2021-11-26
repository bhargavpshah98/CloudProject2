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
let email=require("./routes/emailnotifier");

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



//app.use("/",users);
  app.listen(3000);
  console.log('Server is listening on port 3000');



app.get('/prescription',function(req,res){
  res.render("prescription")
})

app.get('/addprescription',function(req,res){
  console.log(formtopdf)
  res.render("addprescription", {
    utils: formtopdf,
    email: req.query.email
  })
})



  

  app.get("/medSchedule", function (req,res) {
    console.log("process",  process.env["DYNAMODB_TABLE_PRESCRIPTION"]);		
        })

  app.get ("/schedule", function (req,res) {
    res.render ( "schedule.ejs" );	
    } )
  





app.get("/prescriptionview",async(req,res)=>{
  console.log("Prescription Request query",req.query)
  const response= await getPatientPrescriptions(req.query.email)
  const results=response.Items
  console.log("prescription view",results)
  res.render("prescription",{data:results, email: req.query.email})

 })
 
function getPatientPrescriptions(req){
  console.log("patient email", req );
  return new Promise((resolve,reject)=>{

  const db = new AWS.DynamoDB();
   let scanningParam={
     //KeyConditionExpression: 'patientEmail =: patientEmail',
     //ExpressionAttributeNames: {"#PE": "patientEmail"},
     ExpressionAttributeValues: {":u": {S: req},},
     FilterExpression: "patientEmail = :u",
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
      console.log("DATA FROM S3",dataD,req.body.email)
      sendEmail(req.body.email,req.body.name)

      //res.status(200).send({"message":"Success"})
      const db = new AWS.DynamoDB();
      const dbInput = {
            TableName: process.env["DYNAMODB_TABLE_PRESCRIPTION"],
            Item: {
              Id: { S: uuid.v1() },
              patientName: { S: req.body.name },
              prescriptionName: {S: req.body.prescription},
              medicine: {S: req.body.medicine},
              patientEmail: { S: req.body.email},
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


function sendEmail(email,name){



  var params = {
    Destination: { /* required */
      CcAddresses: [
        'medexforu@gmail.com',
        /* more items */
      ],
      ToAddresses: [
       email,
        /* more items */
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
         Charset: "UTF-8",
         Data: '<div><center><img src="https://www.crushpixel.com/stock-photo/assorted-pharmaceutical-medicine-pills-tablets-1959484.html" alt="My Medication"  width="70" height="70"/></center><h3>Hello, '+name+'</h3><p>&nbsp;&nbsp;&nbsp;&nbsp;A new prescription has been added to you by your doctor.Login to the portal to view the details.</p><p>Regards,<br/><b>My Medication Team</b></p></div>'
        },
        Text: {
         Charset: "UTF-8",
         Data: `Dear ${name}, A new prescription has been added to you.Login to your application to view`
        }
       },
       Subject: {
        Charset: 'UTF-8',
        Data: 'Prescription Added.'
       }
      },
    Source: 'medexforu@gmail.com', /* required */
    ReplyToAddresses: [
       'medexforu@gmail.com',
      /* more items */
    ],
  };
  // Create the promise and SES service object
 var sendPromise = new AWS.SES({"accessKeyId":  process.env["accessKeyId"], "secretAccessKey":  process.env["accessSecretKeyId"], "region": process.env["AWS_REGION"]}).sendEmail(params).promise();
  // Handle promise's fulfilled/rejected states
 sendPromise.then(
   function(data) {
     console.log("data-->",data.MessageId);
   }).catch(
     function(err) {
     console.error("errorr-->",err, err.stack);
   });

}
app.post("sign",function(Req,res){
  console.log("sign")
})
app.post("/log",function(req,res){
  res.redirect("/view")
})
app.get("/view",function(req,res){

  console.log("view-->")
  res.render("register")
})
app.use('/delete',require('./routes/prescription-delete'));
app.use('/register',require('./routes/registration'))
app.use('/login',require("./routes/login"))
app.use('/dashboard',require("./routes/dashboard"))
module.exports = app;





