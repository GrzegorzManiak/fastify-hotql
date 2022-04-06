const hotQL = require('../src'),
    gql = require('graphql'),
    fastify = require('fastify');

const createServer = () => {
    const app = fastify();

    app.listen(80).then(() => {
        console.log(`server listening on http://localhost:80`);
    })

    return app;
}

// Test no schema with jest
test('no schema', () => {
    const app = createServer();

    const gql = new hotQL(app, {
        prefix: '/graphql',
    });

    // Response 202 Fastify
    app.inject({
        method: 'GET',
        url: '/graphql',
    }, (err, res) => {
        expect(res.statusCode).toBe(202);
        expect(res.headers['content-type']).toBe('application/json');
        expect(res.body).toBe('{"errors":[{"message":"No schema defined"}]}');
    });
});