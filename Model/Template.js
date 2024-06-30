const mongoose = require("mongoose");
const { Schema } = mongoose;

const TemplateSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      unique: true,
      index: "hashed",
    },
    templates: [
      {
        version: {
          type: Number,
          required: true,
          unique: true,
          index: "hashed",
        },

        clauses: [String],
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Template = mongoose.model("template", TemplateSchema);

module.exports = Template;
