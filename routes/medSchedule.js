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

function getSchedule(req, res, next) {

  console.log(req.query)
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
        S: req.query.email,
      },
    },
    FilterExpression: "patientEmail = :u",
    ProjectionExpression: "#PN, #MN, #MT, #MD, #ET, #BT",
    TableName: process.env["DYNAMODB_TABLE_FORM"]
  };

  db.scan(scanInput, function (err, data) {
    if (err) {
      console.log("Failed to list:", err);
      res.status(404).json({
        err: "Error loading dashboard!",
      });
    } else {
      console.log("Succesful in scanning and retrieving medicine of the user");

      res.status(200).json({
        message: data.Items,
      });

    }
  });
}



router.get("/", getSchedule);



module.exports = router;

