import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();
dotenv.config();

app.use(express.json({ limit: "30mb", extended: true }))
app.use(express.urlencoded({ limit: "30mb", extended: true }))
app.use(cors());

const PORT = 5000;

app.get('/', (req, res) => {
    res.send("Hello World");
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});