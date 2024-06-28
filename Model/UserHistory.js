const mongoose = require('mongoose')
const {Schema} = mongoose

const UserHistorySchema = new Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    search_history: [{
        comapany:{
            type: String,
            required: true,
            index: 'hashed',
            data: [{
                uploaded_pdf: {
                    type: String,
                },
                
                highlighted_pdf: {
                    type: String,
                },
        
                summary: {
                    type: String,
                },

                ner_dic:{
                    type: String,
                },
                compare_dic:{
                    type: Object
                },
                search_date: {
                    type: Date,
                    default: Date.now
                }
            }],
        }
    }]
})

const UserHistory = mongoose.model('userhistory', UserHistorySchema)

module.exports = UserHistory;