import users from '../models/user.js';
import exam from '../models/exam.js';
import generatePassword from '../utils/generatePassword.js';
import mail from '../services/mail.js';
import bcrypt from 'bcrypt';

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
        return res
          .status(400)
          .json({
            message: !examId ? 'No exam specified' : 'No examinee data found',
          });
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

      const existingUsers = await users
        .find({ email: { $in: emails } })
        .select('email');
      const existingEmails = existingUsers.map((user) => user.email);

      // Creating the non-existing users
      const newUsers = [];
      for (const examinee of data.examinees) {
        if (!existingEmails.includes(examinee.Email)) {
            const raw_password = generatePassword();
            const password = await bcrypt.hash(raw_password, await bcrypt.genSalt(10));
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
}

const Examinee = new ExamineesController();
export default Examinee;
