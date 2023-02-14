export default {
  plugin: {
    async register(server, options) {
      server.route([
        {
          method: 'GET',
          path: '/',
          options: {
            auth: false,
            tags: ['api', 'Health'],
            validate: {},
            pre: [],
            handler: async function (request, h) {
              return h.response({
                statusCode: 200,
                message: `API health is good!`,
                data: {}
              });
            },
            description: `Test api health`
          }
        }
      ]);
    },
    version: process.env.API_VERSION,
    name: 'health'
  }
};
