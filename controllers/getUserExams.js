import Exam from '../models/exam.js';

class GetUserExamsController {
    async getExamsByUser(req, res) {
        try {
            const userId = req.user._id;
            // const userRole = req.user.role;  // Uncomment this for role-based logic
            const exams = await Exam.find({ created_by: userId });

            // for role-based if want to specify that student only access the exam based on the permission have
            /*
            let exams;
            if (userRole === 'Faculty') {
                exams = await Exam.find({ created_by: userId });  // Fetch exams created by the user
            } else if (userRole === 'Student') {
                exams = await Exam.find({ enrolled_students: userId });  // Fetch exams the user is enrolled in
            } else {
                return res.status(403).json({ message: 'Access denied' });
            }
            */
            if (!exams.length) {
                return res.status(404).json({ 
                    status: 'fail',
                    message: 'No exams found for this user' 
                });
            }

            return res.status(200).json({
                status: 'Success',
                message: 'Exams fetched successfully',
                data: exams,
            });
            
        } catch (error) {
            return res.status(500).json({ 
                status: 'error',
                message: 'Error fetching exams', 
                error: error.message 
            });
        }
    }
}

const getUserExamsController = new GetUserExamsController();
export default getUserExamsController;
