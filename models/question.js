import { Schema, model } from 'mongoose';

const questionSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    sectionId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    type: {
        type: String,
        enum: ['mcq', 'fill'],
        required: true,
    },
    options: {
        type: [String],
        validate: {
            validator: function (value) {
                return this.type !== 'mcq' || (value && value.length > 0);
            },
            message: (props) => `Options are required for MCQ`,
        },
    },
    correctAns: {
        type: String,
        required: true,
    },
    imgUrl: {
        type: String,
    },
});

const Question = model('questions', questionSchema);
export default Question;
