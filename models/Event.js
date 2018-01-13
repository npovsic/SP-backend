let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

let EventSchema = new Schema({
    id: ObjectId,
    title: String,
    date: String,
    time: String,
    location: String,
    description: String,
    host: {
        type: ObjectId,
        ref: 'User'
    },
    going: [
        {
            type: ObjectId,
            ref: 'User'
        }
    ]
});

let Event = mongoose.model('Event', EventSchema);

module.exports = Event;