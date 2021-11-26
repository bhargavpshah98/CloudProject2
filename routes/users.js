const { response } = require('express');
const express=require('express');
const router=express.Router();
const AWS = require("aws-sdk");
var uuid = require('uuid');
require('dotenv').config();

// const bcrypt=require('bcryptjs');
// const passport=require('passport');
// const AWS = require('aws-sdk');
// const keys=require('./../config/keys');
// const User = require('./../models/user');

//Login Page

router.get('/',(req,res)=>res.render('login'));


//Register Page
 router.get('/register', async(req,res)=>
 {
    const doctors= await getDoctors()
    console.log("doctors--->",doctors)
 
 res.render('register',{data:doctors})
});
 function getDoctors(){
     return new Promise((resolve,reject)=>{
    const db = new AWS.DynamoDB();
    //fetch users
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

 



module.exports=router;