const { response, Router } = require('express');
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
    const pool=new AmazonCognitoIdentity.CognitoUserPool(poolData);

    //get login page
    router.get('/',(req,res)=>res.render('login'));
    
    //post login data

    router.post("/signin",async(req,res)=>{
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
      //res.set('token',token)
   //console.log( res.get('token'))
      //console.log("token",token)
      //res.header('token', token)
      //res.set('token',token)
      res.cookie('auth',token)

      
      //res.send({message:"Success",token:result.getIdToken().getJwtToken(),data:decoded})
      res.redirect(`/dashboard`)
      //console.log("login success")
     //return res.redirect('/dash')
      //res.redirect("/dashboard")
        },
        onFailure: function(err) {
            console.log("error in onfailure",err);
            if(err=="NotAuthorizedException: Incorrect username or password."){
              //res.status(404).send({message:"User does not exist"})
              res.render("displayerror",{data:"Incorrect username or password"})
            }
            else{
              if(err=="UserNotConfirmedException: User is not confirmed."){
                //res.status(200).json({message:"User not confirmed"})
                res.render("displayerror",{data:"User is not confirmed"})
              }
              else{
                res.render("displayerror",{data:"Incorrect username or password"})

              }
           // res.status(200).json({message:"Incorrect Password"})
          
            }
            //res.sendStatus(500).send({"message":"Internal error"})
        },
      
      });
      });
      router.get("/dash",function(req,res){
        console.log("dash",req.headers)
        
      })

      module.exports=router;     
     
    