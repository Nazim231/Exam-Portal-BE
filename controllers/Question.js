import Question from '../models/question.js';

class QuestionController {
    async create(req, res) {
        if (
            !req.body.title ||
            !req.body.section ||
            !req.body.type ||
            !req.body.options ||
            !req.body.correct_ans
        ) {
            return res.status(422).json({ message: 'Incomplete Data' });
        }

        if (
            req.body.type == 'mcq' &&
            (!Array.isArray(req.body.options) || req.body.options.length < 2)
        ) {
            return res.status(422).json({
                message: `Require at least 2 options for MCQ found ${req.body.options}`,
            });
        }

        let ansExists = false;
        if (Array.isArray(req.body.options)) {
            for (let o of req.body.options) {
                if (o.option.trim() === req.body.correct_ans.trim()) ansExists = true;
            }
        }

        if (!ansExists) {
            return res.status(422).json({message: `Correct answer doesn't exists in options.`})
        }

        const ques = {
            title: req.body.title,
            sectionId: req.body.section,
            type: req.body.type,
            options: req.body.options,
            correctAns: req.body.correct_ans,
            imgUrl: req.body.img_url,
        };

        await Question.create(ques)
            .then(() => {
                return res.json({ message: 'Question inserted successfully' });
            })
            .catch((err) => {
                if (err) {
                    return res.status(400).json({ message: err.message });
                }
            });
    }
}

const question = new QuestionController();
export default question;
