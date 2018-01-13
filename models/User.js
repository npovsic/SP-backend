let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

let deepPopulate = require('mongoose-deep-populate')(mongoose);

let UserSchema = new Schema({
    id: ObjectId,
    first_name: String,
    last_name: String,
    city: String,
    country: String,
    email: {
        type: String,
        unique: true
    },
    username: {
        type: String,
        unique: true
    },
    password: String,
    events: {
        created: [
            {
                type: ObjectId,
                ref: 'Event'
            }
        ],
        going: [
            {
                type: ObjectId,
                ref: 'Event'
            }
        ]
    }
});

UserSchema.plugin(deepPopulate, {
    whitelist: [
        'events.created',
        'events.created.host',
        'events.going',
        'events.going.host',
    ]
});


let User = mongoose.model('User', UserSchema);

module.exports = User;