var express = require("express");
var router = express.Router();
const AWS = require('aws-sdk');
const moment = require("moment");

/*var uuid = require('uuid');*/

require("dotenv").config();
AWS.config.update({
  accessKeyId: process.env["ACCESS_KEY_ID"],
  secretAccessKey: process.env["SECRET_ACCESS_KEY"],
  "region": "us-east-1" ,
});

const db = new AWS.DynamoDB();

function getSchedule(req, res, next) {
  const sdate=moment(req.query.sDate).format("YYYY-MM-DD")
  const edate=moment(req.query.eDate).format("YYYY-MM-DD")
  console.log("sdate-->",sdate)

  console.log("req.query-->",req.query)
  var scanInput = {
    ExpressionAttributeNames: {
      "#BT": "bedtimeCount",
      "#MT": "morningCount",
      "#ET": "eveningCount",
      "#MD": "middayCount",
      "#PN": "prescriptionName",
      "#MN": "medicine",
     '#startDate':"startDate",
      '#endDate':"endDate"
    },
    ExpressionAttributeValues: {
      ":u": {
        S: req.query.email,
      },
      ":sd":{
        S:sdate
      },
      ":ed":
      {S:edate
    }
    },
    FilterExpression: "patientEmail = :u and  (:sd <= #endDate and :ed >=#startDate)", 
    ProjectionExpression: "#PN, #MN, #MT, #MD, #ET, #BT",
    TableName: process.env["DYNAMODB_TABLE_PRESCRIPTION"]
  };
 
 

  db.scan(scanInput, function (err, data) {
    if (err) {
      console.log("Failed to list:", err);
      res.status(404).json({
        err: "Error loading dashboard!",
      });
    } else {
      console.log("Succesful in scanning and retrieving medicine of the user",data);

      res.status(200).json({
        message: data.Items,
      });

    }
  });
}



router.get("/", getSchedule);



module.exports = router;
