

import { buildSchema } from 'graphql';
import Fastify from "fastify";
import hotQL from './src/';

const app = Fastify();

const gql = new hotQL(app, {
    prefix: '/graphql',
    graphiql: true,
    graphiql_prefix: '/graphql/explore',
    graphiql_endpoint: '/graphql/explore',
});

let hello = gql.addSchema(buildSchema(`
    type Query {
        hello: String
    }
`), { hello: () => new Date() });

let world = gql.addSchema(buildSchema(`
    type Query {
        test: String
    }
`), { test: 'world' });

world.remove();

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(80).then(() => {
  console.log(`server listening on http://localhost:80`);
})
