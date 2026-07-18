//controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


//register logic

exports.register = async (req, res) => {
    try {
        const { username, displayName, email, password, website } = req.body;
        if(website) {
            return res.status(400).json({message: "Invalid Submission"});
        }

        if (!username || !displayName || !email || !password) {
            return res.status(400).json({message: 'All fields are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({message: 'Password must be at least 8 characters' });
        }

        const existingUser = await User.findOne({$or: [{email}, {username}]});
        if(existingUser) {
            return res.status(409).json({message: 'Username or email already in use'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            displayName,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                rating: user.rating,
            },
        });

    }catch(error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
}



//login logic

exports.login = async(req, res) => {
    const {email, password} = req.body
    try {
        if (!email || !password) return res.status(400).json({message: "All fields required" });
        const existingUser = await User.findOne({email});
        if(!existingUser) return res.status(400).json({message: "Invalid email or password"});
        const match_password = await bcrypt.compare(password, existingUser.password);
        if(!match_password)return res.status(400).json({message: "Invalid email or password"});

        const token = jwt.sign(
            { userId: existingUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({message: "Login successfull", token});

    }catch(error) {
        res.status(500).json({error: error.message});
    }
}


// me endpoint
exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.userId).select('-password');
    res.status(200).json({ user });
};