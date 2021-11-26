const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");

router.get("/",async(req,res)=>{
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

module.exports = router;