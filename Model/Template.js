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

const Template = mongoose.model('Template', TemplateSchema);

module.exports = Template;