const mongoose = require('mongoose');

const { Schema } = mongoose;

const myLessonSchema = new Schema({
    createUser: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
        maxlength: [150, "Хамгийн дээд тал нь 150 тэмдэгтээс илүү байх ёстой"]
    },
    item: {
        type: Schema.Types.ObjectId,
        ref: "Item"
    },
    status: {
        type: String,
        enum: ["pending", "confirmed"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("MyLesson", myLessonSchema);
