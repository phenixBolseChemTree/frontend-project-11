import axios from 'axios';
import parser from './parserRSS.js';
// import { pickOnlyNewPosts, pickOnlyOldPosts } from './dataManipulation.js';
// import renderPosts from './renderPosts.js';

// const fetchDataAuto = (store, link) => {
//   console.log('store - fetchDataAuto :', store);
//   console.log('link - fetchDataAuto :', link);
  // console.log('preventValue', preventValue);
  // axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
  //   .then((response) => { // проверка на удачный response
  //     if (response.status === 200) {
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
      // renderArray(newPosts, id);
  //     const oldPosts = pickOnlyOldPosts(store[id], lastPubDate);
  //     store[id] = [...newPosts, ...oldPosts];
  //     console.log('data from fetchDataAuto: ', data);
  //     console.log('!!!(store[id][0].pubDate): ', store[id][0].pubDate);
  //   })
  //   .then(() => console.log('store from fetchDataAuto:', store))
  //   .catch((error) => {
  //     console.error(error);
  //   })
    // .finally(() => {
      // setTimeout(() => fetchDataAuto(store, link), 5000);
    // });
// };

const fetchData = (store, link) => { // они должны просто заполнять нужный store
  axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
    .then((response) => { // проверка на удачный response
      if (response.status === 200) {
        const domXML = parser(response);
        console.log('link :', link);
        console.log('domXML :', domXML);
        const title = domXML.querySelector('title').textContent;
        const description = domXML.querySelector('description').textContent;
        store.feed.unshift({ title, description });
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
      store.links.unshift(link);
      store.posts.unshift(posts);
      // setTimeout(() => fetchDataAuto(store, link), 5000);
    })
    .catch((error) => {
      alert('Упс, похоже что то пошло не по плану. Повторите запрос позднее');
      console.error(error);
    });
};

export default fetchData;
