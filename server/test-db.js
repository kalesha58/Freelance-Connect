require('dotenv').config();
const mongoose = require('mongoose');

const uris = [
    'mongodb+srv://skill-link:skill-link@cluster0.6tkjukl.mongodb.net/Freelance-Connect?retryWrites=true&w=majority',
    'mongodb+srv://skill-link:skill-link@cluster0.6tkjukl.mongodb.net/SkillLink?retryWrites=true&w=majority',
    'mongodb+srv://skill-link:skill-link@cluster0.6tkjukl.mongodb.net/admin?authSource=admin&retryWrites=true&w=majority',
    'mongodb+srv://skill-link:skill-link@cluster0.6tkjukl.mongodb.net/skill-link?authSource=admin&retryWrites=true&w=majority'
];

async function testConnections() {
    for (const uri of uris) {
        console.log(`Testing URI: ${uri}`);
        try {
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
            console.log('✅ SUCCESS!');
            await mongoose.disconnect();
            return;
        } catch (err) {
            console.error(`❌ FAILED: ${err.message}`);
        }
    }
    console.log('All connection attempts failed.');
}

testConnections();
