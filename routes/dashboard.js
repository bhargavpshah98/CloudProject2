
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
    console.log("Request query",req.params);
    const userType=req.query.userType;
    const userName=req.query.userName
    
  
    if(userType=="Doctor"){
      const response= await getPatients()
    const results=response.Items
     console.log("items printed")
   res.render('dashboard',{data:results,userName:userName})
   
    
  
   }
   else{
    res.render("dashboard",{data:[],userName:userName})
   }
  })
  function getPatients(email,name) {
    console.log("getpatient function")
    return new Promise((resolve,reject)=>{
  
    const db = new AWS.DynamoDB();
   let scanningParam={
     TableName:process.env["DYNAMODB_TABLE_USER"],
   
  //FilterExpression: "doctorName = :i",
     
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
  router.get('/view',function(req,res){
      console.log("render dashboard view",req.headers)
      res.render('dashboard')
  })
  module.exports=router