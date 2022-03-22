import { runHttpQuery, GraphQLOptions } from 'apollo-server-core';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import graphiQL from './GraphiQLPlugin';

export interface FastifyGraphQLOptions {
  prefix: string;
  graphiql?: boolean;
  graphiql_prefix?: string;
  graphiql_endpoint?: string;
  graphql: Omit<GraphQLOptions, 'SchemaHash'>;
}

const GraphQLPlugin = (app: FastifyInstance, options: FastifyGraphQLOptions, next: (err?: Error) => void) => {
  const handler = async (req: FastifyRequest, res: FastifyReply) => {
    const promise = new Promise((resolve) => 
      resolve(runHttpQuery([req, res], {
        method: req.method,
        options: options.graphql,
        query: req.method === 'POST' ? req.body : req.query,
        request: {
          url: req.raw.url,
          method: req.raw.method,
          headers: req.raw.headers as any,
        },
      }
    )));

    promise.then((gqlResponse) => 
      res.header('Content-Type', 'application/json').send((gqlResponse as any)?.graphqlResponse)
    ).catch((error) => {
      if ('HttpQueryError' !== error.name) 
        throw error;

      if (error.headers) Object.keys(error.headers).forEach(header =>
          res.header(header, error.headers[header]));

      res.code(error.statusCode)
        .send(error.message);
    });
  }

  app.all('/', (req, res):void => {
    // Only allow POST and GET methods
    if(req.method !== 'POST' && req.method !== 'GET')
      res.code(405).header('allowed', ['POST', 'GET']).send('Method Not Allowed');

    // Otherwise, handle the request
    else handler(req, res);
  });

  // If graphiql is enabled, add the graphiql route
  if(options?.graphiql === true) graphiQL(app, {
    prefix: options.graphiql_prefix ||'/graphiql',
    endpoint: options.graphiql_endpoint || options.prefix,
  });

  next();
}

export default GraphQLPlugin;
