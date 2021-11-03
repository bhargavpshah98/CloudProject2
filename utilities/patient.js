const AWS = require("aws-sdk");
var uuid = require('uuid');

function insertPatientToDb(req, res) {
    const db = new AWS.DynamoDB();
    const dbInput = {
          TableName: process.env["DYNAMODB_TABLE_PATIENT"],
          Item: {
            id: { S: uuid.v1() },
            patientName: { S: req.body.patientName },
            patientEmail: { S: req.body.patientEmail },
            patientMobile: { N: req.body.patientMobile },
            current_patient: { BOOL: True },
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
            res.status(200).json({
              message: "Upload is successful!",
            });
          }
        });
      }