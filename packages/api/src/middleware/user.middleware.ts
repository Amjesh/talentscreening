import * as Boom from 'boom';

/**
 * This method is responsible for User read API permission
 * Its call to auth0 and get permission according to user roles.
 * Its work like middleware
 * pre is emit before handler method
 */
export const readPermission = {
  assign: 'USER-READ',
  method: async (request, h) => {
    try {
      /* Check API write permission from auth0 according to user auth0 id */
      // await AuthService.isAdmin(request);
      return h.continue;
    } catch (err) {
      global.logger().error('Error in readPermission', err);
      throw Boom.unauthorized('You have not a read permission');
    }
  }
};
