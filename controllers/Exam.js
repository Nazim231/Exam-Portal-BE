import Exam from '../models/exam.js';

class ExamController {
    async create(req, res) {
        if (!req.body.title || !req.body.duration || !req.body.startDate) {
            return res.status(422).json({ message: 'Incomplete Data' });
        }

        // TODO : Title should be unique inside the exams created by single faculty.
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
        if (req.user.role !== 'Faculty') {
            return res.status(403).json({ message: 'Access denied' });
        }
        try {
            const exams = await Exam.find({ createdBy: req.user._id });
            if (!exams.length) {
                return res.status(200).json({ message: 'No exams found for this user' });
            }

            return res.status(200).json({ message: 'Exams fetched successfully', data: exams });
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching exams', error: error.message });
        }
    }

    async fetchById(req, res) {
        const examId = req.params.examId;

        await Exam.findById(examId)
            .then((exam) => {
                if (!exam) {
                    return res.status(404).json({ message: 'No exam found with specified id' });
                }
                return res.status(200).json({ message: 'Exam found', data: exam });
            })
            .catch((err) => {
                return res.status(500).json({ message: 'Error fetching exam', error: err.message });
            });
    }
}

const exam = new ExamController();
export default exam;
