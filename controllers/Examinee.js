import users from '../models/user.js';
import exam from '../models/exam.js';
import generatePassword from '../utils/generatePassword.js';
import mail from '../services/mail.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

class ExamineesController {
    async get(req, res) {
        try {
            const user = await users.find({
                role: 'Student',
                exams: { $in: req.params.examId },
            });
            return res.json({ data: user });
        } catch (error) {
            console.error(error.message);
        }
    }

    async create(req, res) {
        try {
            let { data, examId } = req.body;
            data = JSON.parse(data);
            if (!data.examinees || data.examinees.length == 0 || !examId) {
                return res.status(400).json({
                    message: !examId
                        ? 'No exam specified'
                        : 'No examinee data found',
                });
            }

            // Validating exam existence
            const examsExists = exam.findById(examId);
            if (!examsExists) {
                return res
                    .status(400)
                    .json({ message: 'Invalid exam specified' });
            }

            // getting emails from the examinees data
            const emails = [];
            for (const examinee of data.examinees) {
                if (Object.keys(examinee).length < 2) {
                    return res.status(400).json({ message: 'Incomplete Data' });
                }
                emails.push(examinee['Email']);
            }

            const existingUsers = await users
                .find({ email: { $in: emails } })
                .select('email');
            const existingEmails = existingUsers.map((user) => user.email);

            // Creating the non-existing users
            const newUsers = [];
            for (const examinee of data.examinees) {
                if (!existingEmails.includes(examinee.Email)) {
                    const raw_password = generatePassword();
                    const password = await bcrypt.hash(
                        raw_password,
                        await bcrypt.genSalt(10)
                    );
                    newUsers.push({
                        username: examinee.Name,
                        email: examinee.Email,
                        raw_password,
                        password,
                        role: 'Student',
                    });
                }
            }
            await users.insertMany(newUsers);
            mail.sendPasswordmails(newUsers);
            /**
             * Adding examinee to exams:
             * Add the examId to the exams array of user document.
             */
            await users.updateMany(
                { email: { $in: emails }, role: 'Student' },
                { $addToSet: { exams: examId } }
            );
            return res.json({
                message: `Student Added and exams are assigned to students`,
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    async attemptExam(req, res) {
        if (req.user.role.toLowerCase() != 'student') {
            return res.status(404).json({ message: 'Not Found' });
        }
        const { examId } = req.body;

        await users
            .aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },
                {
                    $project: {
                        email: 1,
                        role: 1,
                        examsIds: '$exams',
                        examExists: {
                            $in: [
                                new mongoose.Types.ObjectId(examId),
                                '$exams',
                            ],
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'exams',
                        localField: 'examsIds',
                        foreignField: '_id',
                        as: 'examDetails',
                    },
                },
                {
                    $project: {
                        email: 1,
                        role: 1,
                        examExists: 1,
                        examDetails: {
                            $filter: {
                                input: '$examDetails',
                                as: 'exam',
                                cond: {
                                    $eq: [
                                        '$$exam._id',
                                        new mongoose.Types.ObjectId(examId),
                                    ],
                                },
                            },
                        },
                    },
                },
            ])
            .then(async (data) => {
                if (data) {
                    // Marking the exam as attempted
                    await users.updateOne(
                        {
                            _id: new mongoose.Types.ObjectId(req.user._id),
                            'attempted.examId': { $ne: new mongoose.Types.ObjectId(examId) }
                        },
                        {
                            $addToSet: {
                                attempted: {
                                    examId: new mongoose.Types.ObjectId(examId),
                                    sections: [],
                                },
                            },
                        }
                    );
                    return res
                        .status(200)
                        .json({ message: 'Exam Found', data: data[0] });
                } else {
                    return res.status(400).json({ message: 'Exam Not Found' });
                }
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ message: err.message });
            });
    }
}

const Examinee = new ExamineesController();
export default Examinee;
