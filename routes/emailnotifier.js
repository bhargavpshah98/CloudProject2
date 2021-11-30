const express=require('express');
const router=express.Router();
const AWS = require('aws-sdk');
const moment = require('moment'); 
var schedule = require('node-cron');

var morning = schedule.schedule('0 9 * * *', function(){
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
                    console.log("data1 morning count", data1);
                    if (err){ throw err}
                    else{

                        for(let j=0;j<data1.Items.length;j++){
                
                            let temp1=data1.Items[j];
                            let subject = 'Morning Reminder of '+temp1.medicine.S+'';
                            let content = '<div><center><img src="https://www.parathon.com/wp-content/uploads/Healthcare2012_12_14.jpg" alt="My Medication"  width="70" height="70"/></center><h3>Hello, '+temp1.patientName.S+'</h3><p>&nbsp;&nbsp;&nbsp;&nbsp;This mail is to remind you regarding your medicine '+temp1.medicine.S+' morning dose. This medicine is recommended by doctor.</p><p>Regards,<br/><b>My Medication Team</b></p></div>'
                            if(temp1.morningCount.N == 1){
                                sendEmail(temp1.patientEmail.S, content, subject);
                            }
                        }
                    }
                })
            }
        }
    });
});

var midday = schedule.schedule('0 13 * * *', function(){
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
                            let subject = 'Midday Reminder of '+temp1.medicine.S+'';
                            let content = '<div><center><img src="https://www.parathon.com/wp-content/uploads/Healthcare2012_12_14.jpg" alt="My Medication"  width="70" height="70"/></center><h3>Hello, '+temp1.patientName.S+'</h3><p>&nbsp;&nbsp;&nbsp;&nbsp;This mail is to remind you regarding your medicine '+temp1.medicine.S+' midday dose. This medicine is recommended by doctor.</p><p>Regards,<br/><b>My Medication Team</b></p></div>'
                            if(temp1.middayCount.N == 1){
                                sendEmail(temp1.patientEmail.S, content, subject);
                            }
                        }
                    }
                })
            }
        }
    });
});

var evening = schedule.schedule('0 17 * * *', function(){
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
                            let subject = 'Evening Reminder of '+temp1.medicine.S+'';
                            let content = '<div><center><img src="https://www.parathon.com/wp-content/uploads/Healthcare2012_12_14.jpg" alt="My Medication"  width="70" height="70"/></center><h3>Hello, '+temp1.patientName.S+'</h3><p>&nbsp;&nbsp;&nbsp;&nbsp;This mail is to remind you regarding your medicine '+temp1.medicine.S+' evening dose. This medicine is recommended by doctor.</p><p>Regards,<br/><b>My Medication Team</b></p></div>'
                            if(temp1.eveningCount.N == 1){
                                sendEmail(temp1.patientEmail.S,content, subject);
                            }
                        }
                    }
                })
            }
        }
    });
});

var night = schedule.schedule('0 21 * * *', function(){
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
                    console.log("data1 morning count", data1);
                    if (err){ throw err}
                    else{

                        for(let j=0;j<data1.Items.length;j++){
                
                            let temp1=data1.Items[j];
                            let subject = 'Night Reminder of '+temp1.medicine.S+'';
                            let content = '<div><center><img src="https://www.parathon.com/wp-content/uploads/Healthcare2012_12_14.jpg" alt="My Medication"  width="70" height="70"/></center><h3>Hello, '+temp1.patientName.S+'</h3><p>&nbsp;&nbsp;&nbsp;&nbsp;This mail is to remind you regarding your medicine '+temp1.medicine.S+' night dose. This medicine is recommended by doctor.</p><p>Regards,<br/><b>My Medication Team</b></p></div>'
                            if(temp1.bedtimeCount.N == 1){
                                sendEmail(temp1.patientEmail.S, content, subject);
                            }
                        }
                    }
                })
            }
        }
    });
});

function sendEmail(email,content, subject){

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
           Data: content
          },
          Text: {
           Charset: "UTF-8",
           Data: ``
          }
         },
         Subject: {
          Charset: 'UTF-8',
          Data: subject, // Subject line
         }
        },
      Source: 'medexforu@gmail.com', /* required */
      ReplyToAddresses: [
         'medexforu@gmail.com',
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