import axios from 'axios';
import parser from './parserRSS.js';
import pickOnlyNewPosts from './pickOnlyNewPosts.js';
import { renderPosts } from './renderContents.js';

const handler = {
  set(target, property, value) {
    const result = Reflect.set(target, property, value);
    console.log('Изменен объект:', target);
    return result;
  },
};
// const addNewPosts = (id, newPosts, store) => {
//   const updatedPosts = new Proxy([...store.posts[id], ...newPosts], handler);
//   store.posts[id] = updatedPosts;
// };

const fetchDataAuto = (store, link, lastDataArg, id) => {
  console.log('1 All params', store, link, lastDataArg, id);
  let lastDateNumber = null; // назначать число последней даты (для новых постов)
  let newPosts = []; // для новых постов в finally
  axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
    .then((response) => { // проверка на удачный response
      if (response.status === 200) {
        const domXML = parser(response);
        return domXML;
      }
    })
    .then((data) => {
      console.log('2 data (domXML)', data);
      return [...data.querySelectorAll('item')].map((nodeItem) => ({
        title: nodeItem.querySelector('title').innerHTML,
        description: nodeItem.querySelector('description').innerHTML,
        link: nodeItem.querySelector('link').innerHTML,
        pubDate: nodeItem.querySelector('pubDate').innerHTML,
      }));
    })
    .then((data) => { // массив всех постов из API
      // проверка что массив не пустой
      console.log('3 parsed data', data);
      if (data.length !== 0) { // посты есть
        newPosts = (pickOnlyNewPosts(data, lastDataArg)).reverse(); // получает новые посты
        renderPosts(newPosts);
        if (newPosts.length !== 0) { // есть новые данные
          console.log('есть новые данные');
          const currentlastData = (data[data.length - 1]).pubDate; // данные есть новая дата
          lastDateNumber = Date.parse(currentlastData);
          const newProxyPosts = newPosts.map((post) => new Proxy(post, handler));
          store.posts[id] = [...store.posts[id], ...newProxyPosts];
          // addNewPosts(id, newPosts, store);
        } else {
          console.log('новые данные не пришли');
          lastDateNumber = lastDataArg;
        }
      } else {
        lastDateNumber = lastDataArg;
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
        console.log('store.posts[id]', store.posts[id]);
        // addNewPosts(id, newPosts, store);
        setTimeout(() => fetchDataAuto(store, link, lastDateNumber, id), 5000); // id === indexArr
      // console.log('lastDateNumber: ', lastDateNumber);
    });
};

let id = 0;

const fetchData = (store, link) => { // они должны просто заполнять нужный store
  axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
    .then((response) => { // проверка на удачный response
      if (response.status === 200) {
        const domXML = parser(response);
        console.log('link :', link);
        console.log('domXML :', domXML);
        const title = domXML.querySelector('title').textContent;
        const description = domXML.querySelector('description').textContent;
        store.feed.push({ title, description });
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
      store.links.push(link);
      store.posts.push(posts.reverse());
      // const idFetch = id;
      // id += 1; // id идентичен index~
      // setTimeout(() => fetchDataAuto(store, link, idFetch), 5000); // нужно создать lastPubDate
      return posts;
    })
    .then((posts) => { // блок для говняного добавления
      const lastData = (posts[posts.length - 1]).pubDate;
      const lastDateNumber = Date.parse(lastData);
      const indexId = id;
      id += 1;
      setTimeout(() => fetchDataAuto(store, link, lastDateNumber, indexId), 5000);
    })
    .catch((error) => {
      alert('Упс, похоже что то пошло не по плану. Повторите запрос позднее');
      console.error(error);
    });
};

export default fetchData;
