import URL from 'url';
import { resolveGraphiQLString } from 'apollo-server-module-graphiql';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export default (fastify: FastifyInstance, options: {
  prefix: string;
  endpoint: string;
}) => {
  fastify.get(options.prefix, async(req: FastifyRequest, res: FastifyReply) => 
    new Promise(async(resolve, reject) => {

      const query = req.url && URL.parse(req.url, true).query,

        graphiqlString = await resolveGraphiQLString(query, { 
          endpointURL: options.endpoint,
        }, [req, res]);
        
      resolve(res.type('text/html').send(graphiqlString));

  }).catch((err?: any) => res.code(500).send(err.message)));
}