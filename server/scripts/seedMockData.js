require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing non-admin data
        const nonAdminUsers = await User.find({ role: { $ne: 'admin' } });
        const nonAdminUserIds = nonAdminUsers.map(u => u._id);
        
        await Job.deleteMany({ clientId: { $in: nonAdminUserIds } });
        await Post.deleteMany({ userId: { $in: nonAdminUserIds } });
        await User.deleteMany({ role: { $ne: 'admin' } });

        console.log('Cleared existing mock data');

        const password = await bcrypt.hash('password123', 10);

        // 1. Create Users
        const users = await User.insertMany([
            {
                name: 'Sarah Chen',
                email: 'sarah@example.com',
                password,
                role: 'freelancer',
                title: 'Senior Frontend Developer',
                profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
                skills: ['React', 'TypeScript', 'Node.js'],
                bio: 'Passionate frontend developer crafting beautiful user experiences.',
                isProfileComplete: true
            },
            {
                name: 'Alex Rivera',
                email: 'alex@example.com',
                password,
                role: 'freelancer',
                title: 'UI/UX Designer',
                profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
                skills: ['Figma', 'UI Design', 'Prototyping'],
                bio: 'Designing interfaces that convert.',
                isProfileComplete: true
            },
            {
                name: 'TechFlow Solutions',
                email: 'hiring@techflow.com',
                password,
                role: 'hiring',
                profilePic: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200',
                isProfileComplete: true
            },
            {
                name: 'Elena Rodriguez',
                email: 'elena@example.com',
                password,
                role: 'freelancer',
                title: 'Data Scientist & AI Expert',
                profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
                skills: ['Python', 'Machine Learning', 'TensorFlow'],
                bio: 'Helping startups leverage AI to transform their businesses.',
                isProfileComplete: true
            },
            {
                name: 'InnovateX Labs',
                email: 'hello@innovatex.com',
                password,
                role: 'hiring',
                profilePic: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200',
                isProfileComplete: true
            }
        ]);

        const [sarah, alex, techflow, elena, innovatex] = users;

        // 2. Create Jobs
        await Job.insertMany([
            {
                title: 'Senior React Native Developer Needed',
                budget: '$5,000 - $8,000',
                budgetType: 'fixed',
                location: 'Remote, US timezone',
                description: 'We are looking for an experienced React Native developer to help us build the next generation of our mobile application. You will be working tightly with our design and backend teams.',
                skills: ['React Native', 'Redux', 'iOS', 'Android'],
                clientId: techflow._id,
                clientName: techflow.name,
                clientAvatar: techflow.profilePic,
                clientRating: 4.8,
                category: 'Mobile Development',
                isRemote: true
            },
            {
                title: 'SaaS Dashboard Redesign (UI/UX)',
                budget: '$45/hr',
                budgetType: 'hourly',
                location: 'Remote',
                description: 'Need a talented designer to completely revamp our analytics dashboard. Looking for a modern, clean, glassmorphism style.',
                skills: ['UI/UX', 'Figma', 'Web Design'],
                clientId: techflow._id,
                clientName: techflow.name,
                clientAvatar: techflow.profilePic,
                clientRating: 4.8,
                category: 'Design',
                isRemote: true
            },
            {
                title: 'Build AI Recommendation Engine',
                budget: '$15,000',
                budgetType: 'fixed',
                location: 'Remote',
                description: 'We are an e-commerce platform looking to integrate a custom AI recommendation engine to boost user engagement and sales.',
                skills: ['Python', 'Data Science', 'Machine Learning', 'AWS'],
                clientId: innovatex._id,
                clientName: innovatex.name,
                clientAvatar: innovatex.profilePic,
                clientRating: 4.9,
                category: 'Data Science',
                isRemote: true
            },
            {
                title: 'Full-stack Engineer for Web3 Startup',
                budget: '$60/hr',
                budgetType: 'hourly',
                location: 'Remote, Europe timezones',
                description: 'Seeking a full-stack engineer with experience in React and Node.js. Web3/Crypto experience is a big plus but not strictly required.',
                skills: ['React', 'Node.js', 'Solidity', 'Web3'],
                clientId: techflow._id,
                clientName: techflow.name,
                clientAvatar: techflow.profilePic,
                clientRating: 4.8,
                category: 'Full Stack Development',
                isRemote: true
            }
        ]);

        // 3. Create Posts
        await Post.insertMany([
            {
                userId: alex._id,
                userName: alex.name,
                userAvatar: alex.profilePic,
                userRole: alex.role,
                type: 'portfolio',
                imageUrl: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=800',
                caption: 'Excited to share my latest web application design concept! Focused on a clean, modern interface with a dark mode aesthetic.',
                tags: ['UI', 'WebDesign', 'DarkTheme'],
                likes: 42,
                comments: []
            },
            {
                userId: sarah._id,
                userName: sarah.name,
                userAvatar: sarah.profilePic,
                userRole: sarah.role,
                type: 'portfolio',
                imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
                caption: 'Just launched a new Next.js project. The performance benefits of Server Components are absolutely incredible!',
                tags: ['Nextjs', 'React', 'Coding'],
                likes: 28,
                comments: []
            },
            {
                userId: techflow._id,
                userName: techflow.name,
                userAvatar: techflow.profilePic,
                userRole: techflow.role,
                type: 'social',
                caption: 'We are expanding our technical team! If you are passionate about building scalable solutions, check out our recent job postings on Skill Link.',
                tags: ['Hiring', 'TechJobs', 'Growth'],
                likes: 15,
                comments: []
            },
            {
                userId: elena._id,
                userName: elena.name,
                userAvatar: elena.profilePic,
                userRole: elena.role,
                type: 'portfolio',
                imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
                caption: 'Visualizing massive datasets is always a fun challenge! Here is a sneak peek at a dashboard I built for real-time financial tracking.',
                tags: ['DataScience', 'DataViz', 'Python'],
                likes: 89,
                comments: []
            },
            {
                userId: innovatex._id,
                userName: innovatex.name,
                userAvatar: innovatex.profilePic,
                userRole: innovatex.role,
                type: 'social',
                imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
                caption: 'Our team is growing rapidly! We believe in building a fully remote, asynchronous culture where top talent thrives.',
                tags: ['Startup', 'RemoteWork', 'Culture'],
                likes: 124,
                comments: []
            },
            {
                userId: alex._id,
                userName: alex.name,
                userAvatar: alex.profilePic,
                userRole: alex.role,
                type: 'social',
                caption: 'Anyone else spending half their day tweaking the shadow and border-radius settings to get that perfect smooth look? 😂',
                tags: ['Design', 'Humor', 'CSS'],
                likes: 215,
                comments: []
            }
        ]);

        console.log('Successfully seeded database with rich mock data!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
