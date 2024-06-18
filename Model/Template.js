const mongoose = require('mongoose')
const {Schema} = mongoose

const TemplateSchema = new Schema ({
    agreeType: {
        type: String,
        required: true,
        unique: true
    },

    clauses: [String],
    url: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Template = mongoose.model('template', TemplateSchema);

module.exports = Template;