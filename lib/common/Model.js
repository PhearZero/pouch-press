import {Store} from './Store.js';
import {SchemaError} from './Errors.js';
// import showdown from 'showdown';
import Ajv from 'ajv';

// const converter = new showdown.Converter();
const ajv = new Ajv({useDefaults: true, allErrors: true});

/**
 * @typedef {import('ajv').ValidateFunction} ValidateFunction
 */


/**
 * Model
 */
export class Model {
  /**
   * Model Constructor
   * @param {Store} store
   * @param {Object} schema
   * @param {Object} [data]
   * @param {boolean} [save]
   * @return {Promise<unknown>}
   */
  constructor(store, schema, data = {}, save = false) {
    if (!(store instanceof Store)) {
      throw new Error('Invalid store');
    }
    /**
     * Schema
     * @type {Object}
     * @private
     */
    this._schema = schema;
    /**
     * Validator
     * @type {ValidateFunction}
     * @private
     */
    this._validate = ajv.compile(this._schema);
    /**
     * Store
     * @type {Store}
     * @private
     */
    this._store = store;

    // Default timestamp
    if (typeof data.timestamp === 'undefined') data.timestamp = Date.now();

    // Validate data
    if (!this._validate(data)) {
      throw new SchemaError(this.constructor.name, this._validate.errors);
    }
    return new Promise((resolve, reject) => {
      if (typeof data._rev !== 'undefined') {
        this.data = data;
        resolve(this);
      } else {
        store.db.get(data._id).then((info = {}) => {
          this.data = {
            ...info,
            ...data,
          };
          if (save) {
            this.save().then(() => {
              resolve(this);
            });
          } else {
            resolve(this);
          }
        }).catch((e) => {
          if (e.name === 'not_found') {
            this.data = data;
            if (save) {
              this.save().then(() => {
                resolve(this);
              });
            } else {
              resolve(this);
            }
          } else {
            reject(e);
          }
        });
      }
    });
  }

  /**
   * Is Dirty
   * @return {boolean}
   */
  get isDirty() {
    return typeof this._data._rev === 'undefined';
  }

  /**
   * Get Model Data
   * @return {Object}
   */
  get data() {
    return Object.keys(this._data)
        .sort()
        .reduce((acc, key) => {
          acc[key] = this._data[key];
          return acc;
        }, {});
  }

  /**
   * Set Model Data
   * @param {Object} data
   */
  set data(data) {
    this._data = Object.keys(data)
        .sort()
        .reduce(function(acc, key) {
          acc[key] = data[key];
          return acc;
        }, {});
  }

  /**
   * Validate
   *
   * @param {Object} data
   * @return {boolean}
   */
  validate(data) {
    return this._validate(data);
  }

  /**
   * Get ID
   */
  get id() {
    this._data._id;
  }

  /**
   * Get REV
   * @return {undefined|string}
   */
  get rev() {
    return this._data._rev;
  }

  /**
   * Is Valid
   * @return {boolean}
   */
  get isValid() {
    const valid = this.validate(this.data);
    if (!valid) console.log(this._validate.errors);
    return valid;
  }

  /**
   *
   * @param {Object} data
   * @param {boolean} merge
   * @return {Promise<Model>}
   */
  async update(data, merge = true) {
    const updated = merge ? {
      ...this.data,
      ...data,
    } : {
      ...data,
      _rev: this.data._rev,
    };
    if (this.validate(updated)) {
      this.data = updated;
    } else {
      throw new SchemaError(this.constructor.name, this._validate.errors);
    }
    return await this.save();
  }

  /**
   *
   * @param {Store} store
   * @return {Promise<Model>}
   */
  async save(store = this._store) {
    if (!this.isValid) {
      throw new SchemaError(this.constructor.name, this._validate.errors);
    }
    const res = await store.db.put(this.data);
    this.data = {
      ...this.data,
      _rev: res.rev,
    };
    return this;
  }
}
