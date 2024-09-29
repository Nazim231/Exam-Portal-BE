import { Schema, model } from 'mongoose';

const sectionSchema = new Schema({
    exam_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    rank: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    num_questions: {
        type: Number,
        required: true,
    },
});

const Section = model('sections', sectionSchema);

export default Section;
