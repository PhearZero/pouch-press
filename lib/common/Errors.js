import {Colors as C} from './Colors.js';
import {isBrowser} from './Flags.js';


/**
 * @typedef {import('ajv').ErrorObject} ErrorObject
 */

/**
 * ErrorObject.instancePath to Key
 *
 * @param {string} instancePath
 * @return {string}
 */
function instancePathToKey(instancePath) {
  return instancePath.substring(1).replaceAll('/', '.');
}

/**
 *
 * @param {ErrorObject[]} errors
 * @return {*}
 */
function toObject(errors) {
  return errors.reduce((prev, current)=>{
    prev[instancePathToKey(current.instancePath)] = current.message;
    return prev;
  }, {});
}

/**
 * Convert to Colorful JSON
 *
 * @param {ErrorObject[]} errors
 * @param {boolean} [skip]
 * @return {string} Colorized JSON
 */
function toJSON(errors, skip = false) {
  const inner = errors.reduce((prev, current, index) => {
    // prev[current.instancePath.substring(1)] = current.message
    prev += `${instancePathToKey(current.instancePath)}: "${current.message}"`;

    if (index !== errors.length - 1) {
      prev += ', ';
    }
    return prev;
  }, '');


  return `{ ${C.yellow(inner, skip)} ${isBrowser ? C.red('}', skip) : '}'}`;
}

/**
 * SchemaError
 *
 * Handle DefinedError[] from ajv
 */
export class SchemaError extends TypeError {
  /**
     * SchemaError Constructor
     * @param {string} name
     * @param {ErrorObject[]} errors
     */
  constructor(name, errors) {
    super(typeof window === 'undefined' ?
      `${C.red(name)} ${toJSON(errors)}` :
      `🛑 ${name} ${toJSON(errors, true)}`,
    );

    const colors = ['color: red'];

    isBrowser && console.warn(
        `⚠️ ${C.red(name)}`,
        ...colors,
        toObject(errors),
    );

    /**
     * Error Name
     * @type {string}
     */
    this.name = 'SchemaError';

    if (isBrowser) {
      /**
       * DefinedError Array
       * @type {ErrorObject[]}
       */
      this.errors = errors;
    }
  }
}
