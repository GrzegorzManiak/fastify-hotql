

import { buildSchema } from 'graphql';
import Fastify from "fastify";
import hotQL from './src';

const app = Fastify();

const gql = new hotQL(app, {
    prefix: '/graphql',
    graphiql: true,
    graphiql_prefix: '/graphql/explore',
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
`), {
    test: (
        root,
        args,
        context,
        info,
    ) => {
        console.log(context)

        return 'world';
    }
});


app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(80).then(() => {
  console.log(`server listening on http://localhost:80`);
})
