import GraphQLPlugin from "./GraphQLPlugin";
import { FastifyInstance } from "fastify";

export default (fastify: FastifyInstance, options: any, next: (err?: Error) => void) =>
  GraphQLPlugin(fastify, options, next);
