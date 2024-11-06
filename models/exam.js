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
        startDate: {
            type: Date,
            required: true,
            validate: {
                validator: (val) => {
                    const now = new Date();
                    const validatedTime = new Date(now.getTime() + 30 * 60000);
                    return val >= validatedTime;
                },
                message: 'Exam starting time should be at least 30 min greater than current time',
            },
        },
        status: {
            type: String,
            enum: ['Scheduled', 'Postponed', 'In Progress', 'Finished'],
            default: 'Scheduled',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Exam = model('exam', examSchema);
export default Exam;
