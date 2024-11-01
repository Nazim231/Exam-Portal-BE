import User from '../models/user.js';
import { auth as Authentication } from '../services/auth.js';
import bcrypt from 'bcrypt';
import mail from '../services/mail.js';
import generateEmailHTML from '../services/generateEmailHTML.js';
/**
 * Manages the user authentication
 */
class AuthController {
  // Register User
  async register(req, res) {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username/Email/Password is not provided' });
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
        otp: Math.floor(100000 + Math.random() * 900000),
        otpExpiresAt: new Date().getTime() + 1000 * 60 * 15,
      };
      await User.create(newUser)
        .then((user) => {
          const sessionId = Authentication.generateAccessToken(user);
                    res.cookie('session', sessionId, { httpOnly: true, secure: false, sameSite: 'Lax' });
          mail.sendMail(
            user.email,
            user.username,
            'Verify your Email',
            generateEmailHTML(user.username, user.otp)
          );
                    return res.status(200).json({ message: 'User registered successfully' });
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
            return res.status(400).json({ message: 'Please provide email, password' });
    }

    // Find user by email
    await User.findOne({ email })
      .then(async (user) => {
                if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        // generating user access token for communicating with API
        const sessionId = Authentication.generateAccessToken(user);
        res.cookie('session', sessionId, {
          httpOnly: true,
          sameSite: 'Lax',
          secure: false,
        });
                return res.status(200).json({ message: 'Login successfull', userStatus: user.emailVerified });
      })
      .catch((err) => {
        return res.status(400).json({ message: err.message });
      });
  }

  async verifyEmail(req, res) {
    const { otp } = req.body;

    if (!otp || req.user.verified) {
      return res.status(401).json({ message: 'Unprocessable Content' });
    }
    try {
            const verification = await User.updateOne(
                { email: req.user.email, otp: otp, otpExpiresAt: { $gt: new Date() } },
                {
                    $set: {
                        emailVerified: true,
                    },
                    $unset: {
                        otp: '',
                        otpExpiresAt: '',
                    },
                }
            );
      if (verification.matchedCount === 0) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
            const token = Authentication.generateAccessToken({ ...req.user, verified: true });
      res.cookie('session', token);
      return res.json({ message: 'OTP Verified' });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  async resendEmail(req, res) {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000);
      const udpatedUserOTP = await User.updateOne(
        { _id: req.user._id },
        {
          $set: {
            otp: otp,
            otpExpiresAt: new Date().getTime() + 1000 * 60 * 15,
          },
        }
      );

      if (udpatedUserOTP.matchedCount == 0) {
                return res.status(400).json({ message: 'Failed to send mail, try again later' });
      }
      mail.sendMail(
        req.user.email,
        req.user.username,
        'Verify your Email',
        generateEmailHTML(req.user.username, otp)
      );
      return res.json({ message: 'Mail sent successfully' });
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  }

  logout(req, res) {
        res.clearCookie('session', { httpOnly: true, secure: false, sameSite: 'Lax' });
    return res.json({ message: 'logged out' });
  }
}

const Auth = new AuthController();
export default Auth;
