import section from '../models/section.js';
import exam from '../models/exam.js';
import Question from '../models/question.js';
import mongoose from 'mongoose';
import User from '../models/user.js';

class SectionController {
    async get(req, res) {
        const examId = req.params.examId;
        try {
            const sections = await section
                .find({ exam_id: examId })
                .sort({ rank: 1 });
            return res.json({ data: sections });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    async create(req, res) {
        const { examId, data } = req.body;

        const secIds = [];
        try {
            const examData = await exam.findById(examId);
            if (!examData) {
                return res
                    .status(404)
                    .json({ message: `No exam found with ID: ${examId}` });
            }

            // Creating Sections
            let i = 1;
            const sectionsData = JSON.parse(data);
            for (const sec of Object.values(sectionsData)) {
                const secResult = await section.create({
                    ...sec,
                    exam_id: examId,
                    rank: i++,
                });
                secIds.push(new mongoose.Types.ObjectId(secResult._id));
                // Create questions for each section
                for (const ques of sec.question_sheet) {
                    const quesData = {
                        title: ques.Question,
                        sectionId: secResult._id,
                        type: ques.Type.toLowerCase(),
                        correctAns: ques['Correct Ans'],
                    };
                    if (quesData.type === 'mcq') {
                        quesData['options'] = [
                            ques['Option 1'],
                            ques['Option 2'],
                            ques['Option 3'],
                            ques['Option 4'],
                        ];
                    }
                    await Question.create(quesData);
                }
            }

            return res.json({ message: `Sections created successfully` });
        } catch (err) {
            await this.rollbackChanges(secIds);
            if (err) return res.status(500).json({ message: err.message });
        }
    }

    async attempt(req, res) {
        const { sectionData } = req.body;

        await section.findById(sectionData.sectionId).then(async (result) => {
            if (!result) {
                return res.status(500).json({ message: 'Section not found' });
            }
            await Question.aggregate([
                {
                    $match: {
                        sectionId: new mongoose.Types.ObjectId(
                            sectionData.sectionId
                        ),
                    },
                },
                { $sample: { size: result.num_question } },
            ]).then(async (fetchedQuestions) => {
                if (!fetchedQuestions) {
                    return res
                        .status(500)
                        .json({ message: 'Failed to fetch questions' });
                }

                const assignedQuestions = [];
                fetchedQuestions.forEach((question) => {
                    return assignedQuestions.push({
                        questionId: new mongoose.Types.ObjectId(question._id),
                        answer: '',
                        status: 'unattempted',
                        result: 'incorrect',
                    });
                });
                await User.updateOne(
                    {
                        _id: new mongoose.Types.ObjectId(req.user._id),
                        'attempted.examId': new mongoose.Types.ObjectId(
                            sectionData.examId
                        ),
                        'attempted.sections.sectionId': {
                            $ne: new mongoose.Types.ObjectId(
                                sectionData.sectionId
                            ),
                        },
                    },
                    {
                        $push: {
                            'attempted.$[exam].sections': {
                                sectionId: new mongoose.Types.ObjectId(
                                    sectionData.sectionId
                                ),
                                questions: assignedQuestions,
                            },
                        },
                    },
                    {
                        arrayFilters: [
                            {
                                'exam.examId': new mongoose.Types.ObjectId(
                                    sectionData.examId
                                ),
                            },
                        ],
                    }
                )
                    .then((result) => {
                        if (result) {
                            return res.json({ message: 'Attempting Section' });
                        } else {
                            return res
                                .status(500)
                                .json({ message: 'Error Occured' });
                        }
                    })
                    .catch((err) => {
                        return res.status(500).json({ message: err.message });
                    });
            });
        });
    }

    async rollbackChanges(sectionIds) {
        if (sectionIds.length == 0) return;

        await Question.deleteMany({ sectiondId: { $in: sectionIds } });
        await section.deleteMany({ _id: { $in: sectionIds } });
    }
}

const Section = new SectionController();
export default Section;
