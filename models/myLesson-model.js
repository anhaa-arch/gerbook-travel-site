const mongoose = require('mongoose');

const { Schema } = mongoose;

const myLessonSchema = new Schema({
    createUser: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "course"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("MyLesson", myLessonSchema);
