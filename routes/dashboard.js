
const { response, Router } = require('express');
const express=require('express');
const router=express.Router();
const AWS = require("aws-sdk");
var uuid = require('uuid');
require('dotenv').config();
const decodeJwt=require("jwt-decode")
const path = require('path');    
const bodyParser = require('body-parser'); 
const ejs = require('ejs');

router.get("/",async(req,res)=>{
 
  const token=req.headers.cookie.substring(5,req.headers.cookie.length)
  //console.log("req.header",token)
    
  var decode=decodeJwt(token);
   console.log("Request query",decode);
    const userType=decode['custom:userType']
    const userName=decode.name
    
    const doctors= await getDoctors()
    const user = await getUser(decode.email)
    console.log("items printed", user)
    
    if(userType=="Doctor"){
      const response= await getPatients(decode.email)
      
    const results=response.Items
     
     res.render('dashboard',{data:results,userName:userName,token:token,userDetails:decode, doctors:doctors, user: user})
   }
   else{
    res.render("dashboard",{data:[],userName:userName,token:token,userDetails:decode, doctors:doctors, user: user})
   }
  //res.render("dashboard",{data:[],userName:"Shruthi"})
  })

  router.post("/update",async(req,res)=>{
    console.log("update req", req.body);
    updateUserToDb(req,res);
    res.status(200).send({message:"Update is successful!"})
    })
  

  //get doctors
function getDoctors(){
  return new Promise((resolve,reject)=>{
 const db = new AWS.DynamoDB();

  var paramsdb = {
     TableName: process.env["DYNAMODB_TABLE_USER"],
     
     ExpressionAttributeValues : {
         ":i"  : {S: "Doctor"}
     },
     
     FilterExpression: "userType = :i",
 };
 db.scan(paramsdb, function (err, data) {
     if(err){
         console.log("err")
     }
     else{
     //console.log("DB DATA", data.Items );
     resolve(data.Items)
     }
 })
})
}

  function getPatients(email,name) {
    console.log("getpatient function")
    return new Promise((resolve,reject)=>{
  
    const db = new AWS.DynamoDB();
    let scanningParam={
     TableName:process.env["DYNAMODB_TABLE_USER"],
     ExpressionAttributeValues : {
      ":i"  : {S:email }
    },
  
      FilterExpression: "doctorEmail = :i",   
    }
    db.scan(scanningParam,function(err,data){
     if(err){
       console.log("err",err)
       reject(err)
     }
     else{
       console.log("data",data)
       resolve(data)
     }
   })
  })
  }

  function updateUserToDb(req,res) {
  
    const db = new AWS.DynamoDB();
    
    const dbInput = {
        TableName: process.env["DYNAMODB_TABLE_USER"],
        Key: {
          email : {S:req.body.email},
        },
        UpdateExpression: 'set doctorEmail = :r, doctorName = :n',
        ExpressionAttributeValues: {
          ':r': {S:req.body.doctorEmail},
          ':n': {S:req.body.doctorName}
        },
         };
         db.updateItem(dbInput, function (putErr, putRes) {
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


    router.get('/view',function(req,res){
        console.log("render dashboard view",req.headers)
        res.render('dashboard')
    })
    module.exports=router


    function getUser(email){

      return new Promise((resolve,reject)=>{
     const db = new AWS.DynamoDB();
    
      var paramsdb = {
         TableName: process.env["DYNAMODB_TABLE_USER"],
         
         ExpressionAttributeValues : {
             ":i"  : {S: email}
         },
         
         FilterExpression: "email = :i",
     };
     db.scan(paramsdb, function (err, data) {
         if(err){
             console.log("err")
         }
         else{
         console.log("DB DATA", data.Items );
         resolve(data.Items)
         }
     })
    })
    }