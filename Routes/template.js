// to use express Router
const express = require("express");
const router = express.Router();

// to validate the given parameter in request
const { body } = require("express-validator");

// template modal
const Template = require("../Model/Template");

// middlewares
const fetchUser = require("../Middelwares/fetchUser");
const upload = require("../Middelwares/fetchPDFs.js");

// installing controllers
const addTemplate = require("../Controllers/template/addTemplate.js");
const removeTemplate = require("../Controllers/template/removeTemplate.js");
const updateTemplate = require("../Controllers/template/updateTemplate.js");

// add Template
router.post("/add",fetchUser,
  [
    body("version", "Provide version  to remove template").not().isEmpty(),
  ],
  upload.single("url"),
  addTemplate
);

//remove template
router.post("/remove",fetchUser,
  [
    body("version", "Provide version  to remove template").not().isEmpty()
  ],
  removeTemplate
);

//update template
router.post("/update",fetchUser,
  [
    body("version", "Provide version  to update").not().isEmpty()
  ],
  upload.single("url"),
  updateTemplate
);
