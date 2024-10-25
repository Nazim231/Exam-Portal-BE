import users from '../models/user.js';
import exam from '../models/exam.js';
import generatePassword from '../utils/generatePassword.js';
import bcrypt from 'bcrypt';

class ExamineesController {
    async create(req, res) {
        try {
            let { data, examId } = req.body;
            data = JSON.parse(data);
            if (!data.examinees || data.examinees.length == 0 || !examId) {
                return res.status(400).json({ message: !examId ? 'No exam specified' : 'No examinee data found' });
            }

            // Validating exam existence
            const examsExists = exam.findById(examId);
            if (!examsExists) {
                return res.status(400).json({ message: 'Invalid exam specified' });
            }

            // getting emails from the examinees data
            const emails = [];
            for (const examinee of data.examinees) {
                if (Object.keys(examinee).length < 2) {
                    return res.status(400).json({ message: 'Incomplete Data' });
                }
                emails.push(examinee['Email']);
            }

            const existingUsers = await users.find({ role: 'Student', email: { $in: emails } }).select('email');
            const existingEmails = existingUsers.map((user) => user.email);

            // Creating the non-existing users
            const newUsers = [];
            for (const examinee of data.examinees) {
                if (!existingEmails.includes(examinee.Email)) {
                    newUsers.push({
                        username: examinee.Name,
                        email: examinee.Email,
                        password: generatePassword(),
                        role: 'Student',
                    });
                }
            }
            await users.insertMany(newUsers);

            /**
             * Adding examinee to exams:
             * Add the examId to the exams array of user document.
             */
            await users.updateMany({ email: { $in: emails }, role: 'Student' }, { $addToSet: { exams: examId } });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
}

const Examinee = new ExamineesController();
export default Examinee;
