require('dotenv').config();
const mongoose = require('mongoose');

async function backfill() {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await mongoose.connection.db
        .collection('problems')
        .updateMany({ mode: { $exists: false } }, { $set: { mode: 'cp' } });

    console.log('Updated:', result.modifiedCount);
    process.exit(0);
}

backfill();