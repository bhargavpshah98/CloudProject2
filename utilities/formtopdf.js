const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const hbs = require('handlebars');
const data = require('./database.json');
const moment = require('moment');
const AWS = require("aws-sdk");
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });


console.log('here !!');
const compile = async function(templateName, data){
    const filePath = path.join(process.cwd(), 'utilities', `${templateName}.hbs`);
    const html = await fs.readFile(filePath,'utf-8');
    return hbs.compile(html)(data);
};

hbs.registerHelper('dateFormat', function(value, format) {
    console.log('formatting', value, format);
    return moment(value).format(format);
});

const createpdf = async function(data) {
    console.log("data pdf")
    try {
        const browser = await puppeteer.launch({
            //executablePath:'/usr/bin/chromium-browser',
            args: ["--no-sandbox", "--disabled-setupid-sandbox"],
        }
        );
        const page = await browser.newPage();
        console.log(1);
        const content = await compile('pdf', data);
        console.log(2);
        //await page.goto('http://localhost:3000/addprescription')
        await page.setContent(content);
        await page.emulateMediaType('screen');
        console.log(3);
        const path=new Date()+"prescription.pdf"
        await page.pdf({
            path: path,
            format: 'A4',
            printBackground: true
        });
        console.log(1);
        return path

    /*    const s3result = await s3
      .upload({
        Bucket: process.env.S3_BUCKET,
        Key: `${Date.now()}.pdf`,
        Body: buffer,
        ContentType: "application/pdf",
        ACL: "public-read",
      })
      .promise();
*/
        // console.log('done');
        // await browser.close();
        // process.exit();
    }
    catch (e) {
        console.log('our error', e);
        return false
    }
}

/*module.export = {
    createpdf() {}
}*/

module.exports.createpdf = createpdf;
