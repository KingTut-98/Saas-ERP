import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schema';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();
  
  app.use(cors());
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use('/graphql', expressMiddleware(server));

  app.get('/health', (_, res) => {
    res.json({ status: 'OK', service: 'ETA Compliance SaaS Backend', timestamp: new Date() });
  });

  app.listen(PORT, () => {
    console.log(`🚀 ETA Compliance GraphQL Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
