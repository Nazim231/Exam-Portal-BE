import Exam from '../models/exam.js';

class ExamController {
    async create(req, res) {
        if (!req.body.title || !req.body.duration || !req.body.start_date) {
            return res.status(422).json({ message: 'Incomplete Data' });
        }

        const exam = {
            title: req.body.title,
            duration: req.body.duration,
            start_date: req.body.start_date,
            created_by: req.user._id,
        };
        await Exam.create(exam)
            .then((exam) => {
                if (exam) {
                    return res.json({ message: 'Exam successfully created' });
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
}

const exam = new ExamController();
export default exam;
