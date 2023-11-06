var express = require('express');
var router = express.Router();
const fs = require('fs');
var path = require('path');

/* GET pictures listing. */
router.get('/', function(req, res, next) {
  const pictures = fs.readdirSync(path.join(__dirname, '../pictures/'));
  res.render('pictures', { pictures: pictures});
});

// Route for serving a single picture by name
router.get('/:pictureName', function(req, res, next) {
  const pictureName = req.params.pictureName;
  const picturePath = path.join(__dirname, '../pictures/', pictureName);

  // Check if the file exists
  if (fs.existsSync(picturePath)) {
    // Serve the image file
    res.sendFile(picturePath);
  } else {
    // If the file does not exist, send a 404 response
    res.status(404).send('Picture not found');
  }
});

// router.get('/:pictureName', function(req, res, next) {
//   res.render('pictureDetails', { picture: req.params.pictureName });
// });


//display a file from the request in the logs and save in folder
router.post('/', function(req, res, next) {
    const file = req.files.file;
    fs.writeFileSync(path.join(__dirname, '../pictures/', file.name), file.data);
    console.log(req.files);
    res.end();
  });

module.exports = router;