const { requiresAuth } = require('express-openid-connect');
var express = require('express');
var router = express.Router();
const fs = require('fs');
var path = require('path');
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

/* GET pictures listing. */
router.get('/', requiresAuth(), async function(req, res, next) {
  console.log(req.oidc.user);
  var params = {
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Delimiter: '/',
    Prefix: req.oidc.user.email + '/'
  };
  var allObjects = await s3.listObjects(params).promise();
  var keys = allObjects?.Contents.map( x=> x.Key)
  const pictures = await Promise.all(keys.map(async (key) => {
    let my_file = await s3.getObject({
      Bucket: process.env.CYCLIC_BUCKET_NAME,
      Key: key,
    }).promise();
    return {
        src: Buffer.from(my_file.Body).toString('base64'),
        name: key.split("/").pop()
    }
  }))
  res.render('pictures', { pictures: pictures});
});

router.get('/:pictureName', requiresAuth(), async function(req, res, next) {
  const pictureName = req.params.pictureName;
  const params = {
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Key: `public/${pictureName}`
  };

  try {
    // Fetch the file from S3
    const data = await s3.getObject(params).promise();
    // Convert the file to a Base64 string
    const imageBase64 = Buffer.from(data.Body).toString('base64');
    // Send the image data as a response
    res.send(`<img src="data:image/png;base64,${imageBase64}" />`);
  } catch (error) {
    // Handle any errors that might occur
    console.error("Error fetching image from S3:", error);
    res.status(500).send('Error fetching image');
  }
});

//display a file from the request in the logs and save in folder
router.post('/', requiresAuth(), async function(req, res, next) {
  const file = req.files.file;
  console.log(req.files);
  await s3.putObject({
    Body: file.data,
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Key: req.oidc.user.email + "/" + file.name,
  }).promise()
  res.end();
});

module.exports = router;