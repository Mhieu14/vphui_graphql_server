import cors from 'cors';
import { } from 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { connectMongo } from '../../dbconnect';
import models from '../../models';
import resolvers from './resolvers';
import schema from './schema';
import { createApolloServer } from './utils/apollo-server';

// Connect to database
connectMongo();
const isLog = (process.env.NODE_ENV == 'development');
if (isLog) {
  mongoose.set('debug', true);
}

// Initializes application
const app = express();

// Enable cors
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

// enabling CORS for all requests
app.use(cors( /* corsOptions */ ));

// adding morgan to log HTTP requests
// app.use(morgan('dev'));

// Create a Apollo Server
const server = createApolloServer(schema, resolvers, models);
server.applyMiddleware({ app, path: '/graphql' });

// Create http server and add subscriptions to it
const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

// Listen to HTTP and WebSocket server
const PORT = process.env.GRAPHQL_PORT;
httpServer.listen({ port: PORT }, () => {
  console.log(`server ready at http://localhost:${PORT}${server.graphqlPath}`);
  console.log(`Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`);
});
