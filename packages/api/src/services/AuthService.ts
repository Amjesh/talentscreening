const axios = require('axios');
const jwtDecode = require('jwt-decode');
const { find, get } = require('lodash');
const Boom = require('@hapi/boom');
const CacheInterface = require('../../config/nodeFileCache');
const { errorHandler } = require('../utils/errorHandler');

class AuthService {
  /**
   * Curl request to auth0 for management token
   * this is post method
   * @return access_token
   */
  async authM2MToken() {
    try {
      global.logger().info('authM2MToken method called!');
      const cache = CacheInterface.getInstance();
      let m2mAccessToken = cache.get('m2m_access_token');

      if (!m2mAccessToken) {
        const response = await axios({
          method: 'POST',
          url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
          headers: { 'content-type': 'application/json' },
          data: {
            client_id: process.env.M2M_CLIENT_ID,
            client_secret: process.env.M2M_CLIENT_SECRET,
            audience: process.env.M2M_AUDIENCE, // need to change for player state
            grant_type: 'client_credentials'
          }
        });

        const decoded = jwtDecode(response.data.access_token);
        m2mAccessToken = response.data.access_token;

        const tokenExpiry =
          (new Date(decoded.exp * 1000).getTime() - new Date().getTime()) /
          1000;

        cache.set('m2m_access_token', m2mAccessToken, { life: tokenExpiry });

        global.logger().info(`Generate new M2M token and store in cache.`);
      }
      global.logger().info(`Get machine to machine token`);
      return m2mAccessToken;
    } catch (error) {
      global.logger().error(`Error in AuthService.authM2MToken: ${error}`);
      throw new Boom.Boom(error, { statusCode: 403 });
    }
  }

  /**
   * This method is responsible for check user has admin role
   * @param {Hapi request obj} request
   * @return {Array} roles
   */
  async isAdmin(request) {
    global.logger().info('isAdmin method called!');
    /* Get Auth0 management to management API token */
    const m2mToken = await this.authM2MToken();

    /* Get Auth0 user role by user auth0 id */
    const userRoles = await this.Auth0UserRoles(request.user.auth0Id, m2mToken);

    if (userRoles.length > 0 && find(userRoles, { name: 'admin' })) {
      global.logger().info('User has admin role!');
      return true;
    } else {
      global.logger().error('User has not assign auth0 admin role!');
      throw new Boom.Boom('User has not assign auth0 admin role', {
        statusCode: 401
      });
    }
  }

  /**
   * Curl request for user permissions in object of array
   * Call user permission auth0 api with user auth0Id
   * This is get request
   * @param {Hapi request obj} request
   * @return {Array} roles
   */
  async Auth0UserRoles(auth0Id, m2mToken) {
    try {
      global.logger().info('AuthService.Auth0UserRoles method called!');
      const result = await axios({
        method: 'GET',
        url: `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${auth0Id}/roles`,
        headers: {
          Authorization: `Bearer ${m2mToken}`
        }
      });

      global.logger().info('Get user auth0 roles!');
      return get(result, 'data', []);
    } catch (error) {
      global
        .logger()
        .error('Getting error in AuthService.Auth0UserRoles!', error);
      errorHandler(error);
    }
  }

  /**
   * This method is responsible for check user has admin role
   * @param {Hapi request obj} request
   * @return {Boolean} true/false
   */
  async isRoleExist(request, role) {
    try {
      global.logger().info('AuthService.isRoleExist method called!');
      /* Get Auth0 management to management API token */
      const m2mToken = await this.authM2MToken();

      /* Get Auth0 user role by user auth0 id */
      const userRoles = await this.Auth0UserRoles(
        request.user.auth0Id,
        m2mToken
      );
      if (find(userRoles, { name: role })) {
        global.logger().info(`User has ${role} role!`);
        return true;
      } else {
        global.logger().error(`User has not assign auth0 ${role} role!`);
        throw new Boom.Boom('Unauthorized access', { statusCode: 401 });
      }
    } catch (error) {
      global.logger().error(`Error in AuthService.isRoleExist:`, error);
      throw new Boom.Boom(error, { statusCode: 401 });
    }
  }
}

export default new AuthService();
