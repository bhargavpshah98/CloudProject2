const express=require('express');
const router=express.Router();
const AWS = require('aws-sdk');
const moment = require('moment'); 
var schedule = require('node-cron');

var morning = schedule.schedule('* * * * * *', function(){
    console.log("cron triggered");
    const db = new AWS.DynamoDB();
    //fetch users
     var paramsdb = {
        TableName: process.env["DYNAMODB_TABLE_USER"],
        
        ExpressionAttributeValues : {
            ":i"  : {S: "Patient"}
        },
        
        FilterExpression: "userType = :i",
    };

    db.scan(paramsdb, function (err, data) {
        console.log("DB DATA", data.Items );
        if (err){ throw err}
        else{
            
            for(let i=0;i<data.Items.length;i++){

                let temp=data.Items[i];
                //let phone=temp.phone;

                var params = {
                    TableName: process.env["DYNAMODB_TABLE_PRESCRIPTION"],
                    FilterExpression: "#sn = :i and :yr between #start_yr and #end_yr",
                    ExpressionAttributeNames:{
                        "#sn": "patientEmail",
                        "#start_yr": "startDate",
                        "#end_yr": "endDate",
                    },
                    ExpressionAttributeValues : {
                        ':i'  : {S:temp.email.S},
                        ":yr": {S:moment().format("YYYY-MM-DD")}
                    }
                };

                db.scan(params, function (err, data1) {
                    
                    if (err){ throw err}
                    else{

                        for(let j=0;j<data1.Items.length;j++){
                
                            let temp1=data1.Items[j];
                            
                            if(temp1.morningCount == '1'){
                                
                                sendEmail(temp1.patientEmail,temp1.patientName, temp1.medicine);
                          
                            }
                        }
                    }
                })
            }
        }
    });
});

function sendEmail(email,name, medicine){

    var params = {
      Destination: { /* required */
        CcAddresses: [
          'shruthisrinivasan97@gmail.com',
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
           Data: '<div><center><img src="https://www.crushpixel.com/stock-photo/assorted-pharmaceutical-medicine-pills-tablets-1959484.html" alt="My Medication"  width="70" height="70"/></center><h3>Hello, '+name+'</h3><p>&nbsp;&nbsp;&nbsp;&nbsp;This mail is to remind you regarding your medicine '+medicine+' morning dose. This medicine is recommended by doctor.</p><p>Regards,<br/><b>My Medication Team</b></p></div>'
          },
          Text: {
           Charset: "UTF-8",
           Data: ``
          }
         },
         Subject: {
          Charset: 'UTF-8',
          Data: 'Morning Reminder of '+medicine+'', // Subject line
         }
        },
      Source: 'shruthisrinivasan97@gmail.com', /* required */
      ReplyToAddresses: [
         'shruthisrinivasan97@gmail.com',
        /* more items */
      ],
    };
    // Create the promise and SES service object
   var sendPromise = new AWS.SES({"accessKeyId":  process.env["ACCESS_KEY_ID"], "secretAccessKey":  process.env["SECRET_ACCESS_KEY"], "region": process.env["AWS_REGION"]}).sendEmail(params).promise();
    // Handle promise's fulfilled/rejected states
   sendPromise.then(
     function(data) {
       console.log("data-->",data.MessageId);
     }).catch(
       function(err) {
       console.error("errorr-->",err, err.stack);
     });
  
  }

  module.exports=router;