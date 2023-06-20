import axios from 'axios';
import parser from './parserRSS.js';
// import { pickOnlyNewPosts, pickOnlyOldPosts } from './dataManipulation.js';
// import renderPosts from './renderPosts.js';

const fetchDataStart = (store, link) => { // они должны просто заполнять нужный store
  axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
    .then((response) => { // проверка на удачный response
      if (response.status === 200) {
        const domXML = parser(response);
        console.log('!!!domXML', domXML);
        const title = domXML.querySelector('title').textContent;
        const description = domXML.querySelector('description').textContent;
        store.feed = [...store.feed, { title, description }]; // заполнение для фидов
        return domXML;
      }
    })
    .then((data) => [...data.querySelectorAll('item')].map((nodeItem) => ({ // заполнение для постов
      title: nodeItem.querySelector('title').innerHTML,
      description: nodeItem.querySelector('description').innerHTML,
      link: nodeItem.querySelector('link').innerHTML,
      pubDate: nodeItem.querySelector('pubDate').innerHTML,
    })))
    .then((posts) => {
      store.posts = [...store.posts, posts.reverse()]; // заполнение для постов не забыть reverse
    })
    .catch((error) => {
      console.error(error);
    });
};

const fetchDataAuto = (store, link, preventValue) => {
  // console.log('store: qweqweqweq', store);
  // console.log('link: qwqweqweqw', link);
  // console.log('preventValue', preventValue);
  // axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
  //   .then((response) => { // проверка на удачный response
  //     if (response.status === 200) {
  //       console.log('good');
  //       const domXML = parser(response);
  //       return domXML;
  //     }
  //   })
  //   .then((data) => [...data.querySelectorAll('item')].map((nodeItem) => ({
  //     title: nodeItem.querySelector('title').innerHTML,
  //     description: nodeItem.querySelector('description').innerHTML,
  //     link: nodeItem.querySelector('link').innerHTML,
  //     pubDate: nodeItem.querySelector('pubDate').innerHTML,
  //   })))
  //   .then((data) => {const newPosts = pickOnlyNewPosts(data, lastPubDate);
  //     renderArray(newPosts, id);
  //     const oldPosts = pickOnlyOldPosts(store[id], lastPubDate);
  //     store[id] = [...newPosts, ...oldPosts];
  //     console.log('data from fetchDataAuto: ', data);
  //     console.log('!!!(store[id][0].pubDate): ', store[id][0].pubDate);
  //   })
  //   .then(() => console.log('store from fetchDataAuto:', store))
  //   .catch((error) => {
  //     console.error(error);
  //   })
  //   .finally(() => {
  //     setTimeout(() => fetchDataAuto(store, link, id), 5000);
  //   });
};

export { fetchDataStart, fetchDataAuto };
