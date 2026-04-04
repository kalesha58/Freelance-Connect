require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const Post = require('../models/Post');
        
        // Find all posts where 'likes' is NOT an array or is invalid
        const posts = await Post.find({});
        console.log(`Found ${posts.length} posts. Checking for legacy likes...`);

        let migratedCount = 0;
        for (const post of posts) {
            // Check if likes is a number (legacy)
            if (!Array.isArray(post.likes)) {
                console.log(`Post ${post._id} has legacy likes: ${post.likes}. Resetting to [].`);
                post.likes = [];
                await post.save();
                migratedCount++;
            }
        }

        console.log(`Migration complete! Reset ${migratedCount} legacy posts.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
