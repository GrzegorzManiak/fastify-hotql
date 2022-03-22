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
npm install --save fastify-hotql graphql
```

## Usage

```js
import fastify from "fastify";
import hotQL from 'fastify-hotql';

const app = fastify();

app.register(hotQL, {
  // This is where the app will mount to
  prefix : '/graphql',

  // Should we use graphiql?
  graphiql: true,

  // You can specify where graphiql will mount to
  // It mounts after the grapql prefix
  // Ps: It will be mounted to /graphql/graphiql by default
  graphiql_prefix: '/explorer',

  // You also can specify the graphql endpoint,
  // It defaults to the prefix
  graphiql_endpoint: '/graphql',
  
  // GraphQL settings
  graphql: {
    schema: buildSchema(`
      type Query {
        hello: String
      }
    `),
    rootValue: {
      hello: () => 'Hello world!',
    },
  }
});
```

## Configuration

Both plugins need to be given a prefix, under which they will mount.

GraphQL settings extends [GraphQLServerOptions](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-server-core/src/graphqlOptions.ts#L9-L37)