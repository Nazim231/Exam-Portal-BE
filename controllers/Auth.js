import User from '../models/user.js';
import { auth as Authentication } from '../services/auth.js';
import bcrypt from 'bcrypt';

/**
 * Manages the user authentication
 */
class AuthController {
    // Register User
    async register(req, res) {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res
                .status(400)
                .json({ message: 'Username/Email/Password is not provided' });
        }

        if (password.length < 8 || password.length > 16) {
            return res.status(400).json({
                message: 'Password must be between 8 and 16 characters',
            });
        }

        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Encrypting password
            const salt = await bcrypt.genSalt(10);
            const encPassword = await bcrypt.hash(password, salt);
            // Create and save the new user
            const newUser = {
                username,
                email,
                password: encPassword,
            };
            await User.create(newUser)
                .then((user) => {
                    const sessionId = Authentication.generateAccessToken(user);
                    res.cookie('session', sessionId);
                    return res
                        .status(200)
                        .json({ message: 'User registered successfully' });
                })
                .catch((err) => {
                    return res.status(400).json({ message: err.message });
                });
        } catch (err) {
            // TODO : Customize Data Validation Messages.
            res.status(500).json({ error: err.message });
        }
    }

    // Login user
    async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: 'Please provide email, password' });
        }

        // Find user by email
        const user = await User.findOne({ email })
            .then(async (user) => {
                if (!user || !(await bcrypt.compare(password, user.password))) {
                    return res
                        .status(400)
                        .json({ message: 'Invalid email or password' });
                }
                // generating user access token for communicating with API
                const sessionId = Authentication.generateAccessToken(user);
                res.cookie('session', sessionId);
                return res.status(200).json({ message: 'Login successfull' });
            })
            .catch((err) => {
                return res.status(400).json({ message: err.message });
            });
    }
}

const Auth = new AuthController();
export default Auth;
