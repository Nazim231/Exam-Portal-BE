import Question from '../models/question.js';
import mongoose from 'mongoose';
import User from '../models/user.js';

class QuestionController {
    async get(req, res) {
        const { examId, sectionId } = req.body;

        await User.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
            },
            { $unwind: '$attempted' },
            {
                $match: {
                    'attempted.examId': new mongoose.Types.ObjectId(examId),
                },
            },
            { $unwind: '$attempted.sections' },
            {
                $match: {
                    'attempted.sections.sectionId': new mongoose.Types.ObjectId(
                        sectionId
                    ),
                },
            },
            {
                $project: {
                    questions: '$attempted.sections.questions',
                    _id: 0,
                },
            },
        ])
            .then(async (assignedQuestions) => {
                if (!assignedQuestions) {
                    return res
                        .status(400)
                        .json({ message: 'No questions assigned' });
                }
                const quesIds = [];
                assignedQuestions[0].questions.forEach((question) => {
                    quesIds.push(
                        new mongoose.Types.ObjectId(question.questionId)
                    );
                });
                await Question.aggregate([
                    { $match: { _id: { $in: quesIds } } },
                ])
                    .then((fetchedQuestions) => {
                        return res.json({
                            assignedQuestions: assignedQuestions[0].questions,
                            fetchedQuestions,
                        });
                    })
                    .catch((err) => {
                        if (err) {
                            return res
                                .status(500)
                                .json({ message: err.message });
                        }
                    });
            })
            .catch((err) => {
                if (err) {
                    return res.status(500).json({ message: err.message });
                }
            });
    }

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
                if (o.option.trim() === req.body.correct_ans.trim())
                    ansExists = true;
            }
        }

        if (!ansExists) {
            return res
                .status(422)
                .json({ message: `Correct answer doesn't exists in options.` });
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

    async submitAnswer(req, res) {
        const { answerData } = req.body;
        console.log(answerData);
        // return res.status(400).json({ message: 'Testing' });
        try {
            const updateRes = await User.updateOne(
                {
                    _id: new mongoose.Types.ObjectId(req.user._id),
                    'attempted.sections.questions.questionId':
                        new mongoose.Types.ObjectId(answerData.questionId),
                },
                {
                    $set: {
                        'attempted.$[exam].sections.$[section].questions.$[question].answer':
                            answerData.answer,
                        'attempted.$[exam].sections.$[section].questions.$[question].result':
                            answerData.result,
                        'attempted.$[exam].sections.$[section].questions.$[question].status':
                            answerData.status,
                    },
                },
                {
                    arrayFilters: [
                        {
                            'exam.examId': new mongoose.Types.ObjectId(
                                answerData.examId
                            ),
                        },
                        {
                            'section.sectionId': new mongoose.Types.ObjectId(
                                answerData.sectionId
                            ),
                        },
                        {
                            'question.questionId': new mongoose.Types.ObjectId(
                                answerData.questionId
                            ),
                        },
                    ],
                }
            );
            console.log(updateRes);
            if (updateRes.matchedCount > 0) {
                return res.json({ message: 'Answer Submitted' });
            } else {
                return res
                    .status(400)
                    .json({ message: 'Failed to submit answer' });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: err.message });
        }
    }
}

const question = new QuestionController();
export default question;
