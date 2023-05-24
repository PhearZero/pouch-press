import './style.css';
import javascriptLogo from './javascript.svg';
import viteLogo from '/vite.svg';
import {setupCounter} from './counter.js';

import {Posts} from '../../lib/index.js';
import PouchDB from 'pouchdb';
const PouchHTTP = PouchDB.defaults(
    {prefix: `${window.location.origin}/api`, adapter: 'http'},
);
const db = new PouchHTTP('posts');
const posts = await new Posts(db);
const post = await posts.update({
  _id: 'hello-world',
  timestamp: 1684893559888,
  tags: ['unassigned'],
  title: 5,
  subtitle: 'Get started with blogging!',
  content: 'Here is an example post! \n You can edit this here',
  img: {
    src: 2,
    attrib: {
      href: 5,
    },
  },
}).catch((e)=>{
  console.error(e);
});

console.log(post);
document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`;

setupCounter(document.querySelector('#counter'));
