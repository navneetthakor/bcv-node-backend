// to use the express
const express = require("express");
const router = express.Router();

// to connect with mongoDB collection "Template"
const Template = require("../Model/Template.js");

// middlewares
const upload = require("../Middelwares/fetchPDFs.js");
const fetchUser = require("../Middelwares/fetchUser.js");

// to communicate with ML model
const axios = require("axios");

// to read file
const fs = require("fs");
const path = require("path");
const UserHistory = require("../Model/UserHistory.js");
const { version } = require("os");

// -----------------------------ROUTE:1 Fetch highlighted pdf url annd summary from django server --------------------------

router.post("/fetchdetails", fetchUser,upload.single("file"), async (req, res) => {
  try {
    // Ensure req.file contains the uploaded file details
    // console.log("hlo: ", req.file)
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // to hold body
    const body = {};
    // check whether user wants to compare against template or previous agreement
    if (req.body.mode.toLocaleLowerCase() === "template") {
      body = templateMode(req);
    } else {
      body = comapanyMode(req);
    }

    if (body.error) {
      return res.status(400).json({ error, signal: "red" });
    }

    // Send the cloudinary pdf url to Django server
    const url = `${process.env.MODEL_URL}/contractify/`;
    const response = await axios.post(url, body, {
      headers: {
        "Content-Type": "text/plain",
      },
    });

    // Handle the response from Django (object containing another url and summary)
    const output = response.data;

    // console.log("Output from django side is :\n\n", output) // output.url, output.summary
    const transformedNer = Object.keys(output.ner_dict).map((key) => {
      return { key: key, value: output.ner_dict[key] };
    });

    // update user history-----------------------------------
    const newDataEntry = {
      uploaded_pdf: req.file.path,
      highlighted_pdf: output.highlitedPdf,
      summary: output.summary,
      ner_dic: transformedNer,
      compare_dic: output.compare_dic,
    };
    // Find the user and company
    const userHistory = await UserHistory.findOne(req.user.id);

    // Find the specific company entry in search_history
    let companyHistory = userHistory.search_history.find(
      (sh) => sh.comapany === req.body.companyName
    );

    // if company not found then add new company
    if (!companyHistory) {
      newDataEntry[version] = 0;

      companyHistory = { comapany: req.body.companyName, data: [newDataEntry] };
      userHistory.search_history.push(companyHistory);
    } else {
        newDataEntry[version] = companyHistory.data.length;

      companyHistory.data.push(newDataEntry);
    }

    // save updated document
    userHistory.save();

    console.log(userHistory);

    // return ans -----------
    return res.status(200).json({
      newDataEntry,
      success: true,
    });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ error: "Internal server error", success: false });
  }
});

// function to create body if mode === ' Template'
async function templateMode(req) {
  // collect template-url
  const templateRecord = await Template.findOne(req.user.id);
  const template = templateRecord.templates.find((t) => t.version === req.body.version);

  if (!template) {
    return { error: "corresponding template not found" };
  }

  //crafting body
  const body = {
    inputUrl: req.file.path,
    templateUrl: template.url,
  };
  return body;
}

// function to create body if mode === ' comapany'
async function comapanyMode(req) {
  // find record of company for current user -- O ( 1 ) (due to hashing)
  const hisRecord = await UserHistory(req.user.id);

  if (!hisRecord) {
    return { error: "corresponding userHistory record not found" };
  }
  const serchHis = hisRecord.search_history;

  // finding company record for perticular user -- O ( n )
  let compRecord;
  for (let i = 0; i < serchHis.length; i++) {
    if (
      serchHis[i].company.toLocaleLowerCase() ===
      req.body.companyName.toLocaleLowerCase()
    ) {
      compRecord = serchHis[i].data;
    }
  }
  if (!compRecord) {
    return { error: "corresponding company Record not found" };
  }

  // seraching for perticular version --- O ( log n) (due to binary serach)
  let low = 0;
  let high = compRecord.length - 1;
  let versionRec;

  while (low <= high) {
    let mid = low + (high - low) / 2;

    if (mid == req.body.version) {
      versionRec = compRecord[mid];
      break;
    } else if (mid > req.body.version) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  if (!versionRec) {
    return { error: "corresponding versionRec not found" };
  }

  // crafting body
  const body = {
    inputUrl: req.file.path,
    templateUrl: versionRec.uploaded_pdf,
  };

  return body;
}

module.exports = router;
