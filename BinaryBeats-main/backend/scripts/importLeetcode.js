require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Problem = require('../models/problem');

async function importLeetcode() {
    await mongoose.connect(process.env.MONGO_URI);

    const rawData = JSON.parse(fs.readFileSync('./leetcode_problems.json', 'utf-8'));
    let imported = 0;

    for (const item of rawData) {
        try {
            await Problem.create({
                title: item.title,
                slug: item.titleSlug,
                description: `Solve this problem on LeetCode: ${item.leetcodeUrl}`,
                mode: 'dsa',
                difficultyTier: item.difficulty,
                tags: [],
            });
            imported++;
        } catch (err) {
            console.error(`Skipped "${item.title}":`, err.message);
        }
    }

    console.log(`Imported ${imported} LeetCode problems`);
    process.exit(0);
}

importLeetcode();