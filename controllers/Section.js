import section from '../models/section.js';

class SectionController {
    async create(req, res) {
        if (
            !req.body.title ||
            !req.body.duration ||
            !req.body.exam_id ||
            !req.body.num_questions ||
            !req.body.rank
        ) {
            return res.status(422).json({ message: 'Incomplete Data' });
        }
        const data = {
            title: req.body.title,
            duration: req.body.duration,
            exam_id: req.body.exam_id,
            num_questions: req.body.num_questions,
            rank: req.body.rank,
        };

        await section
            .create(data)
            .then((section) => {
                if (section) {
                    return res.json({
                        message: 'Section created successfully',
                        data: {
                            id: section._id,
                        },
                    });
                }
            })
            .catch((err) => {
                if (err) {
                    return res.status(400).json({
                        message: err.message,
                    });
                }
            });
    }
}

const Section = new SectionController();
export default Section;