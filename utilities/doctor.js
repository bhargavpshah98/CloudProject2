const AWS = require("aws-sdk");
var uuid = require('uuid');

function insertDocToDb(req, res) {
    const db = new AWS.DynamoDB();
    const dbInput = {
          TableName: process.env["DYNAMODB_TABLE_DOCTOR"],
          Item: {
            id: { S: uuid.v1() },
            docName: { S: req.body.docName },
            docEmail: { S: req.body.docEmail },
            docSpec: { S: req.body.docSpec },
            current_doctor: { BOOL: True },
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
  
  