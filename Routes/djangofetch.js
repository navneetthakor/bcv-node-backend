// to use the express 
const express = require('express');
const router = express.Router();

// to upload images 
const upload = require('../Middelwares/fetchImages.js');

// to communicate with ML model
const axios = require('axios');

// to read file 
const fs = require('fs');
const path = require('path');


// -----------------------------ROUTE:1 Fetch highlighted pdf url annd summary from django server --------------------------

router.post('/fetchdetails', upload.single('file'),  async (req, res) => {
    try {
        // Ensure req.file contains the uploaded file details
        console.log("hlo: ", req.file)
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Get the uploaded pdf's url
        let filePath = req.file.path;

        // Send the cloudinary pdf url to Django server
        const url = `${process.env.MODEL_URL}/pdfdetails`;
        const response = await axios.post(url, filePath, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        // Handle the response from Django (object containing another url and summary)
        const output = response.data.response_object
        console.log(output) // output.url, output.summary

        res.status(200).json({ "url":output.url, "summary":output.summary  });
    } catch (error) {
        console.error('Error :', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router