require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Wait for MongoDB before route handlers (avoids Mongoose buffering timeout when connect lags behind requests, e.g. Vercel cold start)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error(err);
        res.status(503).json({ message: 'Database unavailable' });
    }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/api/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) { // routes registered directly on the app
            routes.push(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
        } else if (middleware.name === 'router') { // router middleware
            middleware.handle.stack.forEach((handler) => {
                const route = handler.route;
                route && routes.push(`${Object.keys(route.methods)} ${middleware.regexp} ${route.path}`);
            });
        }
    });
    res.json(routes);
});

app.get('/', (req, res) => {
    res.send('Freelance Connect API is running...');
});

// Error handler (multer / Cloudinary / other)
app.use((err, req, res, next) => {
    console.error(err.stack || err);
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large (max 10MB)' });
        }
        return res.status(400).json({ message: err.message });
    }
    const status = err.status || err.statusCode || 500;
    const message =
        typeof err.message === 'string' && err.message
            ? err.message
            : 'Something went wrong';
    res.status(status).json({ message });
});

// Export for Vercel
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            });
        })
        .catch((err) => {
            console.error('Failed to connect to MongoDB:', err.message);
            process.exit(1);
        });
}
