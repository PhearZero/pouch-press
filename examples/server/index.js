import PouchDB from 'pouchdb';

import {Posts} from '../../lib/index.js';
const PouchLevelDB = PouchDB.defaults({prefix: '../../.data/'});
const db = new PouchLevelDB('posts');

const posts = await new Posts(db);
const post = await posts.update({
  _id: 'hello-world',
  timestamp: 1684893559888,
  tags: ['unassigned'],
  title: 6,
  subtitle: 'Get started with blogging!',
  content: 'Here is an example post! \n You can edit this here',
  img: 'test.jpg',
});

console.log({post});
