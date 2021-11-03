var express = require("express");
var router = express.Router();
const AWS = require("aws-sdk");
var uuid = require('uuid');

function insertFormToDb(req, res) {
    const db = new AWS.DynamoDB();
    const dbInput = {
          TableName: process.env["DYNAMODB_TABLE_PRESCRIPTION"],
          Item: {
            id: { S: uuid.v1() },
            patientName: { S: req.body.patientName },
            patientId: { S: req.body.patientId },
            docName: { S: req.body.docName },
            docId: { S: req.body.docId },
            symptoms: { S: req.body.symptoms },
            medName: { S: req.body.docId },
            medQuantity: {N: req.body.medQuantity},
            medUseTillDate: { S: req.body.medUseTillDate },
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