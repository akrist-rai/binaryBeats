// controllers/cfController.js  
const User = require('../models/user');


//controller to request user to change the first name

exports.startCfVerification = async (req, res) => {
    try {
        const {handle} = req.body;
        if (!handle) {
            return res.status(400).json({ message: 'Codeforces handle is required' });
        }
        const cfResponse = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
        const cfData = await cfResponse.json();

        if(cfData.status !== 'OK') {
            return res.status(400).json({ message: 'Invalid Codeforces handle' });
        }
        const verificationCode = 'CF-VERIFY-' + Math.random().toString(36).slice(2, 8);

        await User.findByIdAndUpdate(
            req.user.userId,
            {
                codeforcesHandle: handle,
                cfVerified: false,
                cfVerificationCode: verificationCode,
                cfVerificationExpires: new Date(Date.now() + 10 * 60 * 1000) //expiry time set to 10 min
            }
        );

        res.status(200).json({
            message: `Set your Codeforces first name to: ${verificationCode}, then confirm.`,
            code: verificationCode,
        });

    }catch(error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}




//controller to verify the change

exports.confirmCfVerification = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user.cfVerificationCode || user.cfVerificationExpires < new Date()) {
            return res.status(400).json({ message: 'Verification expired, please start again' });
        }

        const cfResponse = await fetch(`https://codeforces.com/api/user.info?handles=${user.codeforcesHandle}`);
        const cfData = await cfResponse.json();

        if (cfData.status !== 'OK') {
            return res.status(400).json({ message: 'Could not fetch Codeforces profile' });
        }

        const cfUser = cfData.result[0];
        if (cfUser.firstName !== user.cfVerificationCode) {
            return res.status(400).json({ message: 'Verification code not found on your Codeforces profile' });
        }

        user.cfVerified = true;
        user.rating = cfUser.rating || 0; // pull real CF rating directly
        user.cfVerificationCode = null;
        user.cfVerificationExpires = null;
        await user.save();

        res.status(200).json({ message: 'Codeforces handle verified', handle: user.codeforcesHandle, rating: user.rating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};