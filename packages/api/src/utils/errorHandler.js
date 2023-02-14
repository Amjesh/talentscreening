const Boom = require('@hapi/boom');
const { includes, get } = require('lodash');

/**
 * Match error instance with node popular error instance
 * @param {*} error error
 * @returns {Boolean} true/false
 */
const isReferenceError = function (error) {
  if (
    error instanceof ReferenceError ||
    error instanceof SyntaxError ||
    error instanceof RangeError ||
    error instanceof TypeError
  ) {
    return true;
  } else {
    return false;
  }
};

/**
 * Match error with mongoose error prototype name
 * @param {*} error error
 * @returns {Boolean} true/false
 */
const isMongooseError = function (error) {
  const mongoErrorName = [
    'MongooseError',
    'CastError',
    'DisconnectedError',
    'DivergentArrayError',
    'MissingSchemaError',
    'DocumentNotFoundError',
    'ValidatorError',
    'ValidationError',
    'ValidatorError',
    'MissingSchemaError',
    'ObjectExpectedError',
    'ObjectParameterError',
    'OverwriteModelError',
    'ParallelSaveError',
    'StrictModeError',
    'VersionError',
  ];
  if (!(error || typeof error === 'object')) return false;
  else if (!get(error, 'name', false)) return false;
  else if (includes(mongoErrorName, error.name)) return true;
};

/**
 * Handle error according to there type
 * @param {Error/String/Object} err error
 * @returns {*} throw error
 */
const errorHandler = function (err, customErrorMsg = null) {
  if (Boom.isBoom(err)) {
    throw err;
  } else if (isReferenceError(err) || isMongooseError(err)) {
    const error = new Boom.Boom(err, { statusCode: 500 });
    error.output.payload.error = err.toString();
    if (customErrorMsg) {
      error.output.payload.message = customErrorMsg;
    }
    throw error;
  } else {
    const error = new Boom.Boom(err, { statusCode: 500 });
    if (customErrorMsg) {
      error.output.payload.message = customErrorMsg;
    }
    throw error;
  }
};

module.exports = { errorHandler };
