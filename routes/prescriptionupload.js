const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");
const formtopdf = require('../utilities/formtopdf')
const fs=require("fs")
var uuid = require('uuid');

router.post("/",async(req,res)=>{
    const s3=new AWS.S3();
    console.log("req,para",req.body)
   const response= await formtopdf.createpdf(req.body);
   console.log("Res",response)
   
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

                //res.redirect(`/prescriptionview?email=${req.body.email}`);
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

  module.exports = router;