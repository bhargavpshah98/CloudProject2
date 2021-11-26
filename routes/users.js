const { response } = require('express');
const express=require('express');
const router=express.Router();
const AWS = require("aws-sdk");
var uuid = require('uuid');
require('dotenv').config();
const decodeJwt=require("jwt-decode")
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const poolData = {    
    UserPoolId : "us-west-1_x1klxacrm", // Your user pool id here    
    ClientId : "5nbvps4hlmh0a66mb4k771ns6f" // Your client id here
    }; 
    const pool_region = 'us-east-1';
    const pool=new AmazonCognitoIdentity.CognitoUserPool(poolData)

//Login Page

router.get('/',(req,res)=>res.render('login'));


//render registartion page
//  router.get('/register', async(req,res)=>
//  {
//      console.log("register send")
//     //const doctors= await getDoctors()
//     res.render('register')
   
//     //res.render('register',{data:doctors})
// });

    // post registration data
    // router.post("/register",function(req,res){
    //     console.log()
    //     const { name, email, password, confirm,userType,dob,address} = req.body;
    //        console.log("name",name,email,confirm,password,userType,typeof(userType))
    //     var attributeList = [];
    //      attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value:name}));
    //      attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"gender",Value:"female"}));
    //       attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:email}));
    //       attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"custom:userType",Value:userType}))
    // pool.signUp(email,password,attributeList,null,function(err,result){
    //   if (err) {
    //     console.log("error",err);
    //     if(err=="UsernameExistsException: An account with the given email already exists."){
    //       res.status(403).send({message:"User exists already"})
    //     }
    //     else{
    //     res.status(500).send({message:"Internal error"})
    //     }
    //     //return;
    // }
    // else{
    // console.log("Result",result)
    // cognitoUser = result.user;
    // console.log('user name is ' + cognitoUser.getUsername());
    
    // res.status(200).send({message:"Success"})
    // verifyEmail(email)
    // insertUserToDb(req,res);
    
    // }
//post login

router.post("/login",async(req,res)=>{
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

    //insert users into the db
    
  // function insertUserToDb(req,res) {
  
  //       const db = new AWS.DynamoDB();
  //       const dbInput = {
  //           TableName: process.env["DYNAMODB_TABLE_USER"],
  //              Item: {
  //                Name: { S: req.body.name },
  //                email: { S: req.body.email },
  //                userType: { S: req.body.userType },
  //                gender: {S: req.body.gender},
  //                dob: {S: req.body.dob},
  //                address: {S: req.body.address}
  //              },
  //            };
  //            db.putItem(dbInput, function (putErr, putRes) {
  //              if (putErr) {
  //                console.log("Failed to put item in dynamodb: ", putErr);
  //                res.status(404).json({
  //                  err: "Failed to Upload!",
  //                });
  //              } else {
  //                console.log("Successfully written to dynamodb", putRes);
  //              }
  //            });
  //           }
  //  });
  // });

  // send email on registration to verify
  function verifyEmail(mail){
    console.log("verufyemail function entered")
    var ses=new AWS.SES()
    var params = {
      EmailAddress: mail
   };
    
   ses.verifyEmailAddress(params, function(err, data) {
      if(err) {
        console.log("Err",err)
          //res.send(err);
      }
      else {
        console.log("data--->",data)
         
      }
    
   });
  }



//fetch doctors
//  function getDoctors(){
//      return new Promise((resolve,reject)=>{
//     const db = new AWS.DynamoDB();
   
//      var paramsdb = {
//         TableName: process.env["DYNAMODB_TABLE_USER"],
        
//         ExpressionAttributeValues : {
//             ":i"  : {S: "Doctor"}
//         },
        
//         FilterExpression: "userType = :i",
//     };
//     db.scan(paramsdb, function (err, data) {
//         if(err){
//             console.log("err")
//         }
//         else{
//         //console.log("DB DATA", data.Items );
//         resolve(data.Items)
//         }
//     })
// })

// }

 



module.exports=router;