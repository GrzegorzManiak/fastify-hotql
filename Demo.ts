

import { buildSchema } from 'graphql';
import Fastify from "fastify";
import graphQLfastify from './src/FastifyGraphQL';
import { FastifyGraphQLOptions } from './src/GraphQLPlugin';

const createFastifyApp = async(gqlOptions: FastifyGraphQLOptions): Promise<any> =>{
  const app = Fastify();

  app.register(graphQLfastify, gqlOptions);
  
  app.get('/', (req, res) => {
    res.send('Hello World!');
  })

  await app.listen(80);

  return app.server;
}

createFastifyApp({
  prefix : '/graphql',
  graphiql: true,
  graphiql_prefix: '/explorer',
  graphiql_endpoint: '/graphiql',
  graphql: {
    schema: buildSchema(`
      type Query {
        hello: String
      }

      type Mutation {
        hello: String
      }
    `),
    rootValue: {
      hello: (a:any, b:any, c:any) => {
        return 'Hello world!'
      },
    },
  },
}).then(() => console.log('Server is running on http://localhost:80'));