require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Problem = require('../models/problem');

const slugify = (title) =>
    title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function importProblems() {
    await mongoose.connect(process.env.MONGO_URI);

    const rawData = JSON.parse(fs.readFileSync('./problems_merged.json', 'utf-8'));
    let imported = 0;
    let skipped = 0;

    for (const item of rawData) {
        try {
            if (!item.title || !item.description) {
                skipped++;
                continue;
            }

            const testCases = (item.testCases || []).map((tc) => ({
                input: tc.input,
                expectedOutput: tc.output,
                isHidden: true,
            }));

            const examples = (item.demoInput || []).map((inp, i) => ({
                input: inp,
                expectedOutput: item.demoOutput?.[i] || '',
                isHidden: false,
            }));

            await Problem.create({
                title: item.title,
                slug: slugify(item.title) + '-' + item.contestId,
                description: item.description,
                inputFormat: item.inputFormat || '',
                outputFormat: item.outputFormat || '',
                examples,
                testCases,
                timeLimit: item.timeLimit,
                memoryLimit: item.memoryLimit,
                difficultyRating: item.rating,
                tags: item.tags || [],
            });
            imported++;
        } catch (err) {
            console.error(`Skipped "${item.title}":`, err.message);
            skipped++;
        }
    }

    console.log(`Done. Imported: ${imported}, Skipped: ${skipped}`);
    process.exit(0);
}

importProblems();