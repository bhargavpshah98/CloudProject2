var express = require("express");
var router = express.Router();
const AWS = require('aws-sdk');

/*var uuid = require('uuid');*/

require("dotenv").config();
AWS.config.update({
  accessKeyId: process.env["ACCESS_KEY_ID"],
  secretAccessKey: process.env["SECRET_ACCESS_KEY"],
  "region": "us-east-1" ,
});

const db = new AWS.DynamoDB();

function getSchedule(email) {

  return new Promise((resolve,reject)=>{
  var scanInput = {
    ExpressionAttributeNames: {
      "#BT": "bedtimeCount",
      "#MT": "morningCount",
      "#ET": "eveningCount",
      "#MD": "middayCount",
      "#PN": "prescriptionName",
      "#MN": "medicine"
    },
    ExpressionAttributeValues: {
      ":u": {
        S: email,
      },
    },
    FilterExpression: "patientEmail = :u",
    ProjectionExpression: "#PN, #MN, #MT, #MD, #ET, #BT",
    TableName: process.env["DYNAMODB_TABLE_PRESCRIPTION"]
  };

  db.scan(scanInput, function (err, data) {
    if (err) {
      console.log("Failed to list:", err);
      reject(err)
      
    } else {
      console.log("Succesful in scanning and retrieving medicine of the user");
      resolve(data.Items)

      

    }
  });
});
}



router.get("/", async(req,res)=>{
  const response=await getSchedule('hasinireddy765@gmail.com');
  console.log("res-->",response);
  res.render("schedule")
});




module.exports = router;

