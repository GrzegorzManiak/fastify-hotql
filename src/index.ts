import { runHttpQuery, GraphQLOptions } from 'apollo-server-core';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { GraphQLSchema } from 'graphql';
import { createHash } from 'crypto';
import { mergeSchemas } from '@graphql-tools/schema';
import { SchemaHash } from 'apollo-server-types';
import URL from 'url';
import lodash from 'lodash';
import { resolveGraphiQLString } from 'apollo-server-module-graphiql';

export interface FastifyGraphQLOptions {
  prefix: string;
  graphiql?: boolean;
  graphiql_prefix?: string;
  graphiql_endpoint?: string;
  graphql?: Omit<GraphQLOptions, 'schemaHash'>;
}

export interface FastifyGraphiQLOptions {
    prefix?: string;
    endpoint?: string;
}

export interface FastifySchemaObject {
    schema: GraphQLSchema;
    rootValue?: any;
}

export type RootFunc = (root: any, args: any, context: any, info: any) => any;

export interface rootValue {
    [key: string]: {} | string | number | RootFunc;
}

export default class {
    #app: FastifyInstance;

    #options: FastifyGraphQLOptions;

    #schemas: Array<() => FastifySchemaObject> = [];

    #schema: GraphQLSchema | undefined;
    #rootValue: rootValue;
    #schemaHash: SchemaHash;

    #graphiql_endpoint: string;
    #graphiql_prefix: string;
    #graphiql_instace: boolean = false;

    #calculateSchemaHash(schema: GraphQLSchema):SchemaHash {
        return createHash('sha512').update(JSON.stringify(schema)).digest('hex') as SchemaHash;
    }

    #graphqlHandler(req: FastifyRequest, res: FastifyReply) {
        this.#rootValue = Object.assign(this.#rootValue, {
            fastify: {
                req,
                res
            }
        } as { fastify: { req: FastifyRequest, res: FastifyReply } });
        
        // Only allow POST and GET methods
        if(req.method !== 'POST' && req.method !== 'GET')
            res.code(405).header('allowed', ['POST', 'GET']).send('Method Not Allowed');
        
        // Run the query
        else if (this.#schema) runHttpQuery([req, res], {
                method: req.method,
                options: {
                    rootValue: this.#rootValue,
                    schema: this.#schema,
                    schemaHash: this.#schemaHash
                },
                query: req.method === 'POST' ? req.body : req.query,
                request: {
                    url: req.raw.url,
                    method: req.raw.method,
                    headers: req.raw.headers as any,
                },
        }
        
        // ------ Success ------ //
        ).then((gqlResponse) => {
            res.header('Content-Type', 'application/json').send((gqlResponse as any)?.graphqlResponse)
        
        // ------- Error ------- //
        }).catch((error) => {
            if (error.headers) Object.keys(error.headers).forEach(header =>
                res.header(header, error.headers[header]));
            
            const msg = JSON.parse(error.message).errors.map((err:any) => err = {message: err.message});

            res.code(error.statusCode).send({errors: msg});
        });

        else res.code(202).send('Server Provided No Schema');
    }

    startGraphiQL(options?: FastifyGraphiQLOptions) {
        if(this.#graphiql_instace === true) return;

        this.#graphiql_instace = true;

        this.#app.all(options?.prefix || this.#graphiql_prefix, (req, res):void => {
            // Parse the url query
            const query = req.url && URL.parse(req.url, true).query;

            // Try to fulfill the request
            resolveGraphiQLString(query, { 
              endpointURL: options?.endpoint || this.#graphiql_endpoint,
            
            // ------ Success ------ //
            }, [req, res]).then((graphiqlString) => res.type('text/html').send(graphiqlString)

            // ------- Error ------- //
            ).catch((error) => res.code(500).send(error.message));
        });
    }

    reload() {
        this.#schema = undefined;
        this.#rootValue = undefined;

        this.#schemas.forEach(schema => {
            if(!this.#schema) {
                this.#schema = schema().schema;
                this.#rootValue = schema().rootValue;
            }

            else {
                this.#schema = mergeSchemas({
                    schemas: [this.#schema, schema().schema],
                });
    
                this.#rootValue = lodash.merge(
                    this.#rootValue, 
                    schema()?.rootValue
                );
            }
        });

        if(this.#schema)
            this.#schemaHash = this.#calculateSchemaHash(this.#schema);
    }

    addSchema(schema: GraphQLSchema, rootValue?: rootValue):{ 
        remove: () => void 
        hash: () => SchemaHash,
        schema: () => GraphQLSchema,
        rootValue: () => any
    } {
        const schemaFunc = () => ({ schema, rootValue: rootValue || {} });

        // Push the schema to the schemas array
        this.#schemas.push(schemaFunc);

        // Merge the schemas
        this.reload();

        return {
            remove: () => {
                // Remove the schema from the array
                this.#schemas = this.#schemas.filter((schema, index) => schema !== schemaFunc);

                // Reload the schema
                this.reload();
            },

            hash: ():SchemaHash => this.#calculateSchemaHash(schemaFunc().schema),

            schema: () => schemaFunc().schema,

            rootValue: () => schemaFunc().rootValue
        }
    }

    constructor(app: FastifyInstance, options: FastifyGraphQLOptions) {
        this.#graphiql_prefix = (options?.graphiql_prefix || '/graphiql');
        this.#graphiql_endpoint = (options?.graphiql_endpoint || options.prefix);
        this.#app = app;
        this.#options = options;

        // Check if the user has provided a schema
        if(options.graphql)
            this.addSchema(options.graphql.schema, options.graphql.rootValue);

        // Start graphql endpoint
        this.#app.all(options.prefix, (req, res):void => this.#graphqlHandler(req, res));

        // If graphiql is enabled, add the graphiql route
        if(options?.graphiql === true)
            this.startGraphiQL();
    }
}