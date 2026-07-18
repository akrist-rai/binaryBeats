    // controllers/leetcodeController.js
    const User = require('../models/user');

    const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

    async function fetchLeetCodeProfile(username) {
        const query = `
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                    profile {
                        realName
                        aboutMe
                    }
                }
            }
        `;
        const response = await fetch(LEETCODE_GRAPHQL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { username } }),
        });
        const data = await response.json();
        return data?.data?.matchedUser || null;
    }

    // POST /leetcode/start-verification   { username }
    exports.startLeetcodeVerification = async (req, res) => {
        try {
            const { username } = req.body;
            if (!username) {
                return res.status(400).json({ message: 'LeetCode username is required' });
            }

            const profile = await fetchLeetCodeProfile(username);
            if (!profile) {
                return res.status(400).json({ message: 'Invalid LeetCode username' });
            }

            const verificationCode = 'LC-VERIFY-' + Math.random().toString(36).slice(2, 8);

            await User.findByIdAndUpdate(req.user.userId, {
                leetcodeUsername: username,
                leetcodeVerified: false,
                leetcodeVerificationCode: verificationCode,
                leetcodeVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
            });

            res.status(200).json({
                message: `Set your LeetCode "About Me" or real name to: ${verificationCode}, then confirm.`,
                code: verificationCode,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    };

    // POST /leetcode/confirm-verification
    exports.confirmLeetcodeVerification = async (req, res) => {
        try {
            const user = await User.findById(req.user.userId);

            if (!user.leetcodeVerificationCode || user.leetcodeVerificationExpires < new Date()) {
                return res.status(400).json({ message: 'Verification expired, please start again' });
            }

            const profile = await fetchLeetCodeProfile(user.leetcodeUsername);
            if (!profile) {
                return res.status(400).json({ message: 'Could not fetch LeetCode profile' });
            }

            const matches =
                profile.profile?.realName === user.leetcodeVerificationCode ||
                profile.profile?.aboutMe === user.leetcodeVerificationCode;

            if (!matches) {
                return res.status(400).json({ message: 'Verification code not found on your LeetCode profile' });
            }

            user.leetcodeVerified = true;
            user.leetcodeVerificationCode = null;
            user.leetcodeVerificationExpires = null;
            await user.save();

            res.status(200).json({ message: 'LeetCode username verified', username: user.leetcodeUsername });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    };