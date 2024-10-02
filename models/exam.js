import { Schema, model } from 'mongoose';

const examSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        start_date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Scheduled', 'Postponed', 'In Progress', 'Finished'],
            default: 'Scheduled',
        },
        created_by: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        // enrolled_students: { // Uncomment this if you later want to track enrolled students
        //     type: [Schema.Types.ObjectId],
        //     default: [],
        // },
    },
    {
        timestamps: true,
    }
);

const Exam = model('exam', examSchema);
export default Exam;
