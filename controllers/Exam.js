import Exam from '../models/exam.js';

class ExamController {
    async create(req, res) {
        const exam = {
            title: req.title,
            duration: req.duration,
            start_date: req.start_date,
            created_by: '',
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
