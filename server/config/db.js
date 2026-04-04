const mongoose = require('mongoose');

let connectingPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return;
    }
    if (connectingPromise) {
        await connectingPromise;
        return;
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not set');
    }

    connectingPromise = mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
    });

    try {
        await connectingPromise;
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        connectingPromise = null;
        console.error(`MongoDB connection error: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
