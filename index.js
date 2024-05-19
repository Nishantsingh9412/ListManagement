import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import listRoutes from './routes/lists.js';

const app = express();
dotenv.config();

app.use(express.json({ limit: "30mb", extended: true }))
app.use(express.urlencoded({ limit: "30mb", extended: true }))
app.use(cors());

const PORT = 10000;

app.use('/lists', listRoutes);

app.get('/', (req, res) => {
    res.send("The ListManagement API is Up and Running !");
})

const DATABASE_URL = "mongodb+srv://nishantsingh:NcI5n8Xb5jeOvjwz@cluster0.0muaxm6.mongodb.net"

mongoose.connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas!');
        app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
    })
    .catch((error) => console.log('Error connecting to MongoDB Atlas:', error.message));




