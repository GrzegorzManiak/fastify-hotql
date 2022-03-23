# fastify-hotql
[![Travis](https://img.shields.io/travis/sirsavary/fastify-graphql.svg)](https://travis-ci.org/sirsavary/fastify-graphql)
[![npm](https://img.shields.io/npm/v/fastify-graphql.svg)](https://www.npmjs.com/package/fastify-graphql)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

A plugin for [Fastify](https://github.com/fastify/fastify) that adds GraphQL and GraphiQL support, and hot reloading of schemas and resolvers.

## History

This project was forked from [fastify-apollo](https://github.com/coopnd/fastify-apollo) as it is no longer being maintained fast enough to keep pace with the rapid changes happening in the GraphQL ecosystem.

And now, this project was forked from from [jeromemacias](https://github.com/jeromemacias), This is 4 years old and dosent work anymore.

## Installation

```bash
# Yet to be uploaded
npm install --save fastify-hotql
```

## Usage

```js
import { buildSchema } from 'graphql';
import fastify from "fastify";
import hotQL from 'fastify-hotql';

const app = fastify();

// Initialize hotQL
const gql = new hotQL(app, {
  prefix: '/graphql',

  // You can start graphiql by setting this to true
  // PS: The paramaters below are optional
  graphiql: true,
  graphiql_prefix: '/graphql/explore',
  graphiql_endpoint: '/graphql/explore',
});

// Or you can do this later on the fly
gql.startGraphiQL({
  // PS: Both of these are optional
  prefix: '/graphql/explore',
  endpoint: '/graphql/explore',
});

// And for some reason, you can reload the schema and rootValues
// without having to restart the server
gql.reload();

// Start the server
app.listen(80).then(() => {
  console.log(`server listening on http://localhost:80`);
})

// Add a schema and rootValue to the hotQL instance
// You can do this before we start the server or after
const helloWorld = gql.addSchema(buildSchema(`
  type Query {
      hello: String
  }`,
  { hello: () => 'Hello World!' }
);

// You can also remove a schema
helloWorld.remove();

// You can get the hash of the schema
helloWorld.hash();

// You can get the rootValue
helloWorld.rootValue();

// And you can get the schema
helloWorld.schema();
```