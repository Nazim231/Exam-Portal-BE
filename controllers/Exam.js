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
                        $sort: {startDate: -1}
                    }
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
}

const exam = new ExamController();
export default exam;
