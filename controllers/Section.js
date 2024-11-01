import section from '../models/section.js';
import exam from '../models/exam.js';
import Question from '../models/question.js';
import mongoose from 'mongoose';

class SectionController {
    async get(req, res) {
        const examId = req.params.examId;
        try {
            const sections = await section.find({ exam_id: examId });
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
                return res.status(404).json({ message: `No exam found with ID: ${examId}` });
            }

            // Creating Sections
            let i = 1;
            const sectionsData = JSON.parse(data);
            for (const sec of Object.values(sectionsData)) {
                const secResult = await section.create({ ...sec, exam_id: examId, rank: i++ });
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
                        quesData['options'] = [ques['Option 1'], ques['Option 2'], ques['Option 3'], ques['Option 4']];
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

    async rollbackChanges(sectionIds) {
        if (sectionIds.length == 0) return;

        await Question.deleteMany({ sectiondId: { $in: sectionIds } });
        await section.deleteMany({ _id: { $in: sectionIds } });
    }
}

const Section = new SectionController();
export default Section;
