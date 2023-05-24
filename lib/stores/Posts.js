import {Store} from '../common/Store.js';
import {Post} from '../models/Post.js';

const emit = (key, value) => console.log([key, value]);

/**
 *
 */
export class Posts extends Store {
  /**
     *
     * @param {PouchDB} db
     */
  constructor(db) {
    super(db, Post);
  }

  /**
     * Initialize the Views
     * @return {Promise<void>}
     */
  async init() {
    this.db.get('_design/filter').catch((e) => {
      if (e.name === 'not_found') {
        this.db.put({
          '_id': '_design/filter',
          'views': {
            'tags': {
              'reduce': '_count',
              'map': function(doc) {
                if (Array.isArray(doc.tags)) {
                  doc.tags.forEach((tag) => {
                    emit(tag, doc._id);
                  });
                }
              }.toString(),
            },
            'posts': {
              'reduce': '_count',
              'map': function(doc) {
                if (Array.isArray(doc.tags)) {
                  emit(doc._id);
                }
              }.toString(),
            },
          },
        });
      }
    });
  }

  /**
   *
   * @return {Promise<void>}
   */
  async seed() {

  }
}
