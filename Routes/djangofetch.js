// to use the express 
const express = require('express');
const router = express.Router();

// to connect with mongoDB collection "Template"
const Template = require('../Model/Template.js');

// to upload images 
const upload = require('../Middelwares/fetchPDFs.js');

// to communicate with ML model
const axios = require('axios');

// to read file 
const fs = require('fs');
const path = require('path');


// -----------------------------ROUTE:1 Fetch highlighted pdf url annd summary from django server --------------------------

router.post('/fetchdetails', upload.single('file'),  async (req, res) => {
    try {
        // Ensure req.file contains the uploaded file details
        // console.log("hlo: ", req.file)
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Get the uploaded pdf's url
        // let filePath = req.file.path;

        // collect template-url 
        const template = await Template.findOne({agreeType : req.agreeType});

        if(!template){
            return res.status(404).json({error : "corresponding template not found"});
        }

        // body of request to be sent to django 
        const body = {
            inputUrl : req.file.path,
            templateUrl : template.url,
            agreeType : template.agreeType,
            clauses: template.clauses
        }
        console.log("1st request body : ", body);
        // Send the cloudinary pdf url to Django server
        const url = `${process.env.MODEL_URL}/pdfdetails`;
        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        // Handle the response from Django (object containing another url and summary)
        const output = response.data.response_object
        // console.log(output) // output.url, output.summary

        res.status(200).json({ "userUrl":filePath, "url":output.url, "summary":output.summary, "success" : true  });
    } catch (error) {
        console.error('Error :', error);
        res.status(500).json({ error: 'Internal server error', "success": false});
    }
})

module.exports = router