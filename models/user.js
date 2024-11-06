import { Schema, model } from 'mongoose';

const questionSchema = new Schema({
    questionId: {
        type: Schema.Types.ObjectId,
    },
    answer: {
        type: String,
    },
    status: {
        type: String,
        enum: ['submitted', 'skipped'],
    },
    result: {
        type: String,
        enum: ['correct', 'incorrect'],
    },
});

const sectionSchema = new Schema({
    sectionId: {
        type: Schema.Types.ObjectId,
    },
    status: {
        type: String,
        enum: ['attempted', 'unattempted'],
        default: 'unattempted'
    },
    questions: [questionSchema],
});

const examSchema = new Schema({
    examId: Schema.Types.ObjectId,
    status: {
        type: String,
        default: 'unattempted'
    },
    sections: [sectionSchema],
});

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            minlength: 3,
        },
        email: {
            type: String,
            required: true,
            match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['Faculty', 'Student'],
            default: 'Faculty',
        },
        exams: {
            type: [Schema.Types.ObjectId],
            default: [],
        },
        otp: {
            type: Number,
            minlength: 6,
        },
        otpExpiresAt: {
            type: Date,
        },
        attempted: [examSchema]
    },
    { timestamps: true }
);

const User = model('users', userSchema);

export default User;
