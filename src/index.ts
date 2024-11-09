import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import restRoutes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/snapp').then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

app.get('/', (req, res) => {
  res.send('Hello, Snapp API!');
});

app.use('/', restRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});