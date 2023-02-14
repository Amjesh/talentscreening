const fs = require('fs');
const path = require('path');
const { get, isEmpty } = require('lodash');
const { errorHandler } = require('../utils/errorHandler');

class BaseService {
  /**
   * This method is handle error with custom options
   *
   * @param {*} error
   * @param {*} customErrorMsg
   * @returns
   */
  handleError(error, customErrorMsg = null) {
    return errorHandler(error, customErrorMsg);
  }

  /**
   * This method is responsible for validate and return MongoDB modal
   * @param {*} modalName
   * @param {*} fnName
   * @param {*} version
   * @returns
   */
  validateAndGetModal(modalName: string, fnName: string) {
    /* Type check of modal name, only string accepted */
    if (typeof modalName !== 'string') {
      this.handleError(
        new Error('MongooseService error'),
        `Parameter "Modal" to MongooseService.${fnName}() must be an String, got ${typeof modalName}`
      );
    }

    /* Get modal path using modal name from modal directory */
    const modelsPath = path.join(__dirname, `../models/${modalName}.js`);

    /* Check file is exist or not */
    if (fs.existsSync(modelsPath)) {
      return require(modelsPath);
    } else {
      this.handleError(
        new Error('BaseService modal path error'),
        `${modalName} modal does not exist!`
      );
    }
  }

  /**
   *
   * @param {*} query
   * @param {*} options
   * @returns
   */
  getFetchQuery(query, options = {}) {
    if (options && !isEmpty(options)) {
      if ('select' in options) {
        query.select(options.select);
      }
      if ('populate' in options) {
        query.populate(options.populate);
      }
      if ('limit' in options) {
        query.limit(options.limit);
      }
      if ('offset' in options) {
        query.skip(options.offset);
      }
      if ('sort' in options) {
        query.sort(options.sort);
      }
    }
    return query;
  }

  /**
   * This method is insert a new record in given document
   *
   * @param {Modal query} DB query
   * @param {DB modal} data
   * @return {*} result
   */
  async create(...args) {
    try {
      const { modal, data } = args;
      const Modal = this.validateAndGetModal(modal, 'create');
      global.logger().info(`BaseService ${modal.modelName}.create() called`);
      return await new Modal(data).save();
    } catch (error) {
      global.logger().error('Error in BaseService.create', error);
      this.handleError(error);
    }
  }

  /**
   * Get data by given query
   *
   * @param {Modal query} DB query
   * @param {DB modal} modal
   * @return {*} result
   */
  async findById(...args) {
    try {
      const [modal, id, options] = args;
      const Modal = this.validateAndGetModal(modal, 'findById');
      global.logger().info(`BaseService ${Modal.modelName}.findById() called`);

      let query = Modal.findById(id);
      query = this.getFetchQuery(query, options);

      return await query.lean().exec();
    } catch (error) {
      global.logger().error('Error in BaseService.findById()', error);
      this.handleError(error);
    }
  }

  /**
   * Get data by given query
   * @param {Modal query} DB query
   * @param {DB modal} modal
   * @return {*} result
   */
  async findOne(...args) {
    try {
      const [modal, where, options] = args;
      const Modal = this.validateAndGetModal(modal, 'findOne');
      global.logger().info(`BaseService ${Modal.modelName}.findOne() called`);

      let query = Modal.findOne(where);
      query = this.getFetchQuery(query, options);

      return await query.lean().exec();
    } catch (error) {
      global.logger().error('Error in BaseService.findOne', error);
      this.handleError(error);
    }
  }

  /**
   * Get data by given query
   * @param {Modal query} DB query
   * @param {DB modal} modal
   * @return {*} result
   */
  async find(...args) {
    try {
      const [modal, where, options] = args;
      const Modal = this.validateAndGetModal(modal, 'find');
      global.logger().info(`BaseService ${Modal.modelName}.find() called`);

      let query = Modal.find(where);
      query = this.getFetchQuery(query, options);

      return await query.lean().exec();
    } catch (error) {
      global.logger().error('Error in BaseController.find', error);
      this.handleError(error);
    }
  }

  /**
   * Get data by given query
   * @param {Modal query} DB query
   * @param {DB modal} data
   * @return {*} result
   */
  async update(...args) {
    try {
      const [modal, where, data, options] = args;
      const Modal = this.validateAndGetModal(modal, 'create');
      global.logger().info(`BaseService ${Modal.modelName}.update() called`);

      if (get(options, 'multi', false)) {
        await Modal.updateMany(where, data, {
          new: true,
          safe: true,
          multi: true
        });
        const result = Modal.find(where);
        return result;
      } else {
        return await Modal.findOneAndUpdate(where, data, {
          new: true,
          safe: true,
          multi: true,
          upsert: get(options, 'upsert', false),
          setDefaultsOnInsert: get(options, 'upsert', false)
        });
      }
    } catch (error) {
      global.logger().error('Error in MongooseService.update', error);
      errorHandler(error);
    }
  }

  /**
   * Get data by given query
   * @param {Modal query} DB query
   * @param {DB modal} data
   * @return {*} result
   */
  async delete(...args) {
    try {
      const [modal, where, options] = args;
      const Modal = this.validateAndGetModal(modal, 'create');
      global.logger().info(`BaseService ${Modal.modelName}.delete() called`);

      if (get(options, 'multi', false)) {
        const result = Modal.find(where);
        await Modal.deleteMany(where);
        return result;
      } else {
        return await Modal.findOneAndDelete(where);
      }
    } catch (error) {
      global.logger().error('Error in BaseService.delete()', error);
      errorHandler(error);
    }
  }

  /**
   * Get data by given query
   * @param {Modal query} DB query
   * @param {DB modal} data
   * @return {*} result
   */
  async pagination(...args) {
    try {
      const [modal, where, options, lookups] = args;
      const Modal = this.validateAndGetModal(modal, 'pagination');
      global
        .logger()
        .info(`BaseService ${Modal.modelName}.pagination() called`);

      const query = [{ $match: where }];

      if (options.sort) {
        for (const item in options.sort) {
          options.sort[item] = parseInt(options.sort[item]);
        }
        query.push({ $sort: options.sort });
      }

      if (lookups.length > 0) {
        lookups.forEach((element) => {
          query.push(element);
        });
      }
      query.push(
        {
          $group: {
            _id: null,
            // get a count of every result that matches until now
            count: { $sum: 1 },
            // keep our results for the next operation
            results: { $push: '$$ROOT' }
          }
        },
        // and finally trim the results to within the range given by start/endRow
        {
          $project: {
            count: 1,
            rows: { $slice: ['$results', options.offset, options.limit] }
          }
        }
      );

      const [result] = await Modal.aggregate(query);

      return {
        docs: result ? result.rows : [],
        total: result ? result.count : 0,
        limit: options.limit,
        offset: options.offset
      };
    } catch (error) {
      global.logger().error('Error in BaseService.pagination()', error);
      errorHandler(error);
    }
  }

  /**
   * Get data by given query
   * @param {Modal query} DB query
   * @param {DB modal} data
   * @return {*} result
   */
  async searchAggregation(
    modal,
    searchItem,
    isDropdown,
    page,
    limit,
    skip,
    index
  ) {
    try {
      const Modal = this.validateAndGetModal(modal, 'create');
      global
        .logger()
        .info(
          `BaseService.searchAggregation method called with modal:${Modal.modelName}`
        );

      const data = await Modal.aggregate([
        {
          $search: {
            index,
            autocomplete: { query: searchItem, path: 'name' }
          }
        },
        {
          $project: { _id: 1, name: 1, profileImage: 1, gallery: 1 }
        },
        {
          $addFields: {
            type: Modal.modelName,
            imageUrl: {
              $cond: {
                if: {
                  $eq: [{ $type: '$gallery' }, 'missing']
                },
                then: '$profileImage.originalLink',
                else: '$gallery.originalLink'
              }
            }
          }
        },
        {
          $unset: ['profileImage', 'gallery']
        },
        {
          $limit: limit
        },
        {
          $skip: skip
        }
      ]);
      return data;
    } catch (error) {
      global.logger().error('Error in BaseController.pagination', error);
      errorHandler(error);
    }
  }
}

export default new BaseService();
