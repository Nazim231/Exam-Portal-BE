import mongoose from 'mongoose';
import Exam from '../models/exam.js';
import User from '../models/user.js';

class ExamController {
    async create(req, res) {
        if (
            !req.body.title ||
            !req.body.duration ||
            !req.body.startDate ||
            !req.body.startTime
        ) {
            return res.status(422).json({ message: 'Incomplete Data' });
        }

        const dateObj = new Date(
            `${req.body.startDate}T${req.body.startTime}:00+05:30`
        );
        req.body.startDate = dateObj.toISOString();

        await Exam.create({ ...req.body, createdBy: req.user._id })
            .then((exam) => {
                if (exam) {
                    return res.json({
                        message: 'Exam successfully created',
                        data: {
                            id: exam._id,
                        },
                    });
                } else {
                    return res.json({
                        message: 'Failed to create exam, try again',
                    });
                }
            })
            .catch((err) => {
                return res.status(400).json({
                    message: err.message,
                });
            });
    }

    async fetch(req, res) {
        try {
            if (req.user.role.toLowerCase() !== 'faculty') {
                const exams = await User.aggregate([
                    { $match: { email: req.user.email, role: 'Student' } },
                    {
                        $lookup: {
                            from: 'exams',
                            localField: 'exams',
                            foreignField: '_id',
                            as: 'exams',
                        },
                    },
                    { $unwind: '$exams' },
                    {
                        $project: {
                            _id: 0,
                            examId: '$exams._id',
                            examName: '$exams.title',
                            startDate: '$exams.startDate',
                            duration: '$exams.duration',
                        },
                    },
                    {
                        $sort: { startDate: -1 },
                    },
                ]);
                return res.json({ data: exams });
            }
            const exams = await Exam.find({ createdBy: req.user._id });
            if (!exams.length) {
                return res
                    .status(200)
                    .json({ message: 'No exams found for this user' });
            }

            return res
                .status(200)
                .json({ message: 'Exams fetched successfully', data: exams });
        } catch (error) {
            return res.status(500).json({
                message: 'Error fetching exams',
                error: error.message,
            });
        }
    }

    async fetchById(req, res) {
        const examId = req.params.examId;

        await Exam.findById(examId)
            .then((exam) => {
                if (!exam) {
                    return res
                        .status(404)
                        .json({ message: 'No exam found with specified id' });
                }
                return res
                    .status(200)
                    .json({ message: 'Exam found', data: exam });
            })
            .catch((err) => {
                return res.status(500).json({
                    message: 'Error fetching exam',
                    error: err.message,
                });
            });
    }

    async markAsAttempted(req, res) {
        const examId = req.params.examId;

        if (!examId) {
            return res.status(400).json({ message: 'Exam ID not provided' });
        }

        try {
            const response = await User.updateOne(
                {
                    _id: new mongoose.Types.ObjectId(req.user._id),
                    'attempted.examId': new mongoose.Types.ObjectId(examId),
                },
                {
                    $set: {
                        'attempted.$.status': 'attempted',
                    },
                }
            );
            console.log(response);
            if (response.modifiedCount > 0) {
                return res.json({ message: 'Exam successfully submitted' });
            } else {
                return res
                    .status(400)
                    .json({ message: 'Failed to submit exam' });
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    async attemptedExams(req, res) {
        try {
            const response = await User.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
                },
                {
                    $unwind: '$attempted',
                },
                {
                    $lookup: {
                        from: 'exams',
                        foreignField: '_id',
                        localField: 'attempted.examId',
                        as: 'examDetails',
                    },
                },
                {
                    $unwind: '$examDetails',
                },
                {
                    $project: {
                        examId: '$examDetails._id',
                        status: '$attempted.status',
                        title: '$examDetails.title',
                        attemptedOn: '$examDetails.startDate',
                        duration: '$examDetails.duration',
                    },
                },
            ]);
            if (response.length == 0) {
                return res.json({ message: 'No exams attempted yet' });
            }

            return res.json({
                message: 'Attempted Exams Fetched',
                data: response,
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    async result(req, res) {
        const examId = req.params.examId;
        if (!examId) {
            return res.status(400).json({ message: 'Exam ID not found' });
        }

        try {
            const response = await User.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(req.user._id),
                    },
                },
                {
                    $unwind: '$attempted',
                },
                {
                    $match: {
                        'attempted.examId': new mongoose.Types.ObjectId(examId),
                    },
                },
                {
                    $unwind: '$attempted.sections',
                },
                {
                    $unwind: '$attempted.sections.questions',
                },
                {
                    $group: {
                        _id: null,
                        attemptedCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            '$attempted.sections.questions.status',
                                            'attempted',
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                        skippedCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            '$attempted.sections.questions.status',
                                            'skipped',
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                        unattemptedCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            '$attempted.sections.questions.status',
                                            'unattempted',
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                        correctCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            '$attempted.sections.questions.result',
                                            'correct',
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]);
            return res.json({ message: 'Result Fetched', data: response });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    async detailedReport(req, res) {

        const examId = req.params.examId;

        try {
            const response = await User.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(req.user._id),
                        'attempted.examId': new mongoose.Types.ObjectId(examId),
                    },
                },
                {
                    $unwind: '$attempted',
                },
                {
                    $match: {
                        'attempted.status': 'attempted',
                    },
                },
                {
                    $unwind: '$attempted.sections',
                },
                {
                    $lookup: {
                        from: 'questions',
                        let: {
                            questionIds:
                                '$attempted.sections.questions.questionId',
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $in: ['$_id', '$$questionIds'] },
                                },
                            },
                        ],
                        as: 'questionDetails',
                    },
                },
                {
                    $lookup: {
                        from: 'sections',
                        localField: 'attempted.sections.sectionId',
                        foreignField: '_id',
                        as: 'sectionDetails',
                    },
                },
                {
                    $unwind: '$sectionDetails',
                },
                {
                    $project: {
                        _id: 0,
                        section: {
                            title: '$sectionDetails.title',
                            questions: {
                                $map: {
                                    input: '$attempted.sections.questions',
                                    as: 'userQuestion',
                                    in: {
                                        title: {
                                            $let: {
                                                vars: {
                                                    matchedQuestion: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: '$questionDetails',
                                                                    as: 'q',
                                                                    cond: {
                                                                        $eq: [
                                                                            '$$q._id',
                                                                            '$$userQuestion.questionId',
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                            0,
                                                        ],
                                                    },
                                                },
                                                in: {
                                                    $ifNull: [
                                                        '$$matchedQuestion.title',
                                                        'No Title',
                                                    ],
                                                },
                                            },
                                        },
                                        status: '$$userQuestion.status',
                                        result: '$$userQuestion.result',
                                    },
                                },
                            },
                        },
                    },
                },
            ]);
            console.log(response);
            return res.json({ data: response, message: 'Details Fetched' });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
}

const exam = new ExamController();
export default exam;
