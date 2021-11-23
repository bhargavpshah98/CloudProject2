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
            //req.flash('success_msg','File Deleted!');
            res.redirect('/prescriptionview');

            //delete from dynamo
            //const dynamoDbObj = require('./../models/conn');
            const db = new AWS.DynamoDB();
            var params = {
                TableName: process.env["DYNAMODB_TABLE_PRESCRIPTION"],
                Key: {
                    "cloudfrontKey": fileName
                }
            };
            
            db.deleteItem(params, function (err, data) {
        
                if (err) {
                    console.log(err);
                } else {
                    console.log('Prescription deleted');
                }
            });
        }      
    });


 });

module.exports = router;