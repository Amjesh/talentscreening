'use strict';
import AuthController from './src/controllers/AuthController';
import * as HapiSwagger from 'hapi-swagger';
import routes from './src/routes/index';
const jwksClient = require('jwks-rsa');
const Pack = require('./package.json');

/**
 * This plugin responsible for authorized API
 * For authorization we use jwks-rsa and Auth0
 * By pass Auth0 in testing environment
 */
const authPlugin = {
  async register(server, options) {
    const key =
      process.env.NODE_ENV === 'testing'
        ? process.env.TOKEN_SECRET
        : jwksClient.hapiJwt2KeyAsync({
            jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
          });

    const obj = {
      complete: true,
      key,
      validate: await AuthController.validateUserToken,
      headerKey: 'authorization',
      tokenType: 'Bearer',
      verifyOptions: {
        algorithms: process.env.NODE_ENV === 'testing' ? false : ['RS256']
      }
    };

    // configuring jwt authentication strategy for validation
    server.auth.strategy('jwt', 'jwt', obj);

    // setting default authentication strategy
    server.auth.default('jwt');

    // Add helper method to get request ip
    const getIP = function (request) {
      // We check the headers first in case the server is behind a reverse proxy.
      return (
        request.headers['x-real-ip'] ||
        request.headers['x-forwarded-for'] ||
        request.info.remoteAddress
      );
    };
    server.method('getIP', getIP, {});
  },
  name: 'authenticate',
  version: Pack.version
};

/**
 * Implement swagger for api documentation
 * Set schemes ['http','https'] for options
 * Host is base url retrieve from env files
 * Grouping by tag name
 * If you want to configure auth in swagger uncomment securityDefinitions
 */
const swaggerOption: HapiSwagger.RegisterOptions = {
  schemes: [process.env.APP_SWAGGER_SCHEME || 'http'],
  host: process.env.APP_BASE_URL,
  grouping: 'tags',
  expanded: 'none',
  tags: [],
  info: {
    title: 'API Documentation',
    version: Pack.version
  },
  securityDefinitions: {
    AUTH0_TOKEN: {
      description: 'Auth0 jwt token use for api authentication',
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  }
};

/**
 * Create plugin array with different-different plugin for register in server
 */
let plugins = [
  {
    plugin: require('hapi-auth-jwt2')
  },
  {
    plugin: authPlugin
  },
  {
    plugin: require('hapi-pino')
  },
  {
    plugin: require('hapi-query-builder'),
    options: {
      defaultLimit: process.env.INIT_RECORD
    }
  },
  {
    plugin: require('@hapi/inert')
  },
  {
    plugin: require('@hapi/vision')
  },
  {
    plugin: HapiSwagger,
    options: swaggerOption
  }
];

/**
 * Add cron job plugins
 */
// plugins = plugins.concat({
//   plugin: require('hapi-cron'),
//   options: {
//     jobs: [
//       {
//         name: 'update-status',
//         time: '0 */1 * * * *',
//         timezone: 'Europe/London',
//         request: {
//           method: 'GET',
//           url: '/v1/cronjob/cron-job'
//         },
//         onComplete: (res) => {
//           global.logger().info('Cron: complete update challenge status');
//         }
//       },
//       {
//         name: 'new-submission-notification',
//         time: '0 0 0 * * *',
//         timezone: 'Europe/London',
//         request: {
//           method: 'GET',
//           url: '/v1/cronjob/new-submission-email'
//         },
//         onComplete: (res) => {
//           global.logger().info('Cron: complete sent new submission summary');
//         }
//       }
//     ]
//   }
// });

/**
 * Register all routes in plugins
 * Simply add new routes in routes/index.js file for routing.
 */
plugins = plugins.concat(routes);

module.exports = plugins;
