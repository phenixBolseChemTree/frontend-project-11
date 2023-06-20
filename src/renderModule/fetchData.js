import axios from 'axios';
import parser from './parserRSS.js';
import pickOnlyNewPosts from './pickOnlyNewPosts.js';
import { renderPosts } from './renderContents.js';
// import renderPosts from './renderPosts.js';

// новые фиды рарстут просто вверх так что их легко будет отобразить
// нужно взять у постов 1 массив и 1 индекс. взять его дату и проверить при помощи
// 2 функций есть ли среди новых постов посты свежее этого
// вопрос (нужно ли брать все это из определенного фида если да то мне нужно сделать
// запоминание текущего id по index и сверять значения только с ними но тут проблема ведь данные
// добавляются в начало а не в конец)

// путь говнокода
// брать новые посты из них брать самый новый и добавлять их
// вызывать прямо здесь рендер
// передавать в некст вызов link и lastDateNumber

// мои задачи
// 1 добавлять новые посты в список
// 2 рендерить новые посты в список (можно прямо внутри fetchDataAuto)
const fetchDataAuto = (link, lastData) => {
  let lastDateNumber = null;
  axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
    .then((response) => { // проверка на удачный response
      if (response.status === 200) {
        const domXML = parser(response);
        return domXML;
      }
    })
    .then((data) => [...data.querySelectorAll('item')].map((nodeItem) => ({
      title: nodeItem.querySelector('title').innerHTML,
      description: nodeItem.querySelector('description').innerHTML,
      link: nodeItem.querySelector('link').innerHTML,
      pubDate: nodeItem.querySelector('pubDate').innerHTML,
    })))
    .then((data) => {
      const newPosts = (pickOnlyNewPosts(data, lastData)).reverse();
      renderPosts(newPosts);
      // нужно передавать все в финишь но можно вызвать и здесь
      const currentlastData = (data[data.length - 1]).pubDate;
      lastDateNumber = Date.parse(currentlastData);
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      if (lastDateNumber) {
        setTimeout(() => fetchDataAuto(link, lastDateNumber), 5000);
      }
      console.log('lastDateNumber: ', lastDateNumber);
    });
};

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

      setTimeout(() => fetchDataAuto(link, lastDateNumber), 5000); // нужно создать lastPubDate
    })
    .catch((error) => {
      alert('Упс, похоже что то пошло не по плану. Повторите запрос позднее');
      console.error(error);
    });
};

export default fetchData;
