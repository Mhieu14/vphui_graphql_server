import cors from 'cors';
import { } from 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { connectMongo } from './dbconnect';
import StadiumRoute from './routes/stadium.route';
// require Route
import TeamRoute from './routes/team.route';
// defining the Express app
const app = express();

connectMongo()

const isLog = process.env.NODE_ENV !== 'production';
if (isLog) {
  mongoose.set('debug', true);
}

const PORT = process.env.REST_PORT || 6000;

// defining the Express app
app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: false, limit: '20mb' }));

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('dev'));

app.get('/health-check', (req, res) => {
  res.send('Ok');
});

// require api
app.use('/api', TeamRoute);
app.use('/api', StadiumRoute);
// starting the server
app.listen(PORT, () => {
  console.log(`  Service restAPI start on port: ${PORT}`);
});

// Export our app for testing purposes
// export default app;
