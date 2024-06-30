// to access Template collection
const Template = require("../../Model/Template");

// to check wether requried details are provided in body or not
const { validationResult } = require("express-validator");

const removeTemplate = async (req, res) => {
  try {
    // checking the given parameters
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ error: err.array(), success: false });
    }

    // find template corresponding to user id
    const templateRec = await Template.findById(req.user.id);

    // if  tempate record not found for user (typically it will never happen)
    if (!templateRec) {
      return res.status(400).json({
        error: "template record not found. please contact administrator",
        success: false,
      });
    }

    // extarct templates array
    const templates = templateRec.templates;

    // check that any template is there with same version  as current
    const newTemplates = templates.filter((t) => t.version !== req.body.version);

    const updatedRec = await Template.updateOne(
        templateRec._id,
        {$set : {templates: newTemplates}},
        {new: true}
    )
    return res.status(200).json({newRecord: updatedRec, success: true});
    
  } catch (error) {
    console.log(e);
    res.status(500).json({ error: "Internal server error", success: false });
  }
};

module.exports = removeTemplate;
