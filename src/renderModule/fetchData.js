import axios from 'axios';
import i18next from 'i18next';
import parser from './parserRSS.js';
import pickOnlyNewPosts from './pickOnlyNewPosts.js';

const fetchDataAuto = (store, link, lastDataArg) => {
  // console.log('1 All params', store, link, lastDataArg);
  let lastDateNumber = null; // назначать число последней даты (для новых постов)
  let newPosts = []; // для новых постов в finally
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
    .then((data) => { // массив всех постов из API
      // console.log('!!! parsed data', data);
      if (data.length !== 0) { // посты есть
        newPosts = (pickOnlyNewPosts(data, lastDataArg)).reverse(); // получает новые посты
        if (newPosts.length !== 0) { // есть новые данные
          // console.log('есть новые данные');
          console.log('!!!new Posts!!!', newPosts);
          console.log(store);
          store.posts.push(...newPosts); // вот наша магия !!!!
          const currentlastData = (data[0]).pubDate; // данные есть новая дата
          lastDateNumber = Date.parse(currentlastData);
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
        // addNewPosts(id, newPosts, store);
        setTimeout(() => fetchDataAuto(store, link, lastDateNumber), 5000); // id === indexArr
      // console.log('lastDateNumber: ', lastDateNumber);
    });
};

// let id = 0;

const fetchData = (store, link) => { // они должны просто заполнять нужный store
  const feedback = document.querySelector('.lng-feedback');

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
      store.posts.push(...posts.reverse());
      console.log(i18next.t('successfulScenario'), i18next.t('successfulScenario')); // Успешный сценарий
            feedback.classList.remove('text-danger');
            feedback.classList.add('text-success');
            feedback.textContent = i18next.t('successfulScenario');
      return posts;
    })
    .then((posts) => { // блок для пиздатого добавления
      const lastData = (posts[posts.length - 1]).pubDate;
      const lastDateNumber = Date.parse(lastData);
      setTimeout(() => fetchDataAuto(store, link, lastDateNumber), 5000);
    })
    .catch((error) => {
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      // feedback.textContent = 'Ресурс не содержит валидный RSS';
      feedback.textContent = i18next.t('doesentVolidRSS');
      console.error(error);
    })
    .finally(() => {
      const submitButton = document.querySelector('.lng-button');
      submitButton.disabled = false;
    });
};

export default fetchData;
