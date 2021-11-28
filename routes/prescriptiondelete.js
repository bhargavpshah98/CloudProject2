const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");
// const Files= require('./../models/files');

router.post('/', (req, res) => {
    const s3=new AWS.S3();
    console.log("request body", req.body.fileName);
  
    
    var fileName = req.body.fileName;
    console.log("request body", fileName);
    var params1 = {
        Bucket: "prescriptionmanager",
        Delete: {
            Objects: [
              {
                Key: fileName
              },
            ],
          }
    };

    s3.deleteObjects(params1, function(err, data) {
        
        if (err) {
            res.status(500).json({error: true, Message: err});
        }
        else{
          
            console.log('success bucket delete');
            //console.log ("email", email.S);
            //res.redirect(`/prescriptionview?email=${email.S}`);
            //req.flash('success_msg','File Deleted!');
           
            let id='12'
            const db = new AWS.DynamoDB();
            let scanningParam={
                //KeyConditionExpression: 'patientEmail =: patientEmail',
                //ExpressionAttributeNames: {"#PE": "patientEmail"},
                ExpressionAttributeValues: {":u": {S: fileName},},
                FilterExpression: "cloudfrontKey = :u",
                //ProjectionExpression : "#PE",
                TableName:process.env["DYNAMODB_TABLE_PRESCRIPTION"], 
              }
               db.scan(scanningParam,function(err,data){
                if(err){
                  console.log("err",err)
                  //reject(err)
                }
                else{
                 
                  id=data.Items[0].Id
                  let email=data.Items[0].patientEmail
                  console.log("data---->",data.Items[0].Id,typeof(id))
                  var params = {
                    TableName: process.env["DYNAMODB_TABLE_PRESCRIPTION"],
                    Key: {
                        Id: {
                            S: id.S// My partition key is a number.
                          }
                    }
                };
                
                db.deleteItem(params, function (err, data) {
            
                    if (err) {
                        console.log(err);
                        res.status(500).send({"message":"Error deleting file from db"})
                    } else {
                        console.log('Prescription deleted');
                       res.status(200).send({"message":"Success"})
                        //res.redirect(`/prescriptionview?email=${email.S}`);
                    }
                });
                  //resolve(data)
                }
              })
            }
        })
    });

module.exports = router;