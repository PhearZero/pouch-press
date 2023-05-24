import {defineConfig} from 'vite';
import {pouchdb} from 'vite-pouchdb';
import PouchDB from 'pouchdb';
export default defineConfig({
  plugins: [pouchdb(
      PouchDB.defaults({prefix: './.data/'}), '/api',
  )],
  root: 'examples/browser',
});
