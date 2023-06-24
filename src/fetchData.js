import axios from 'axios';
import i18next from 'i18next';

const parser = (response) => {
  const domParser = new DOMParser();
  return domParser.parseFromString(response.data.contents, 'application/xml');
};

const pickOnlyNewPosts = (posts, lastDateNumber) => {
  const newPosts = posts.filter((post) => {
    if (new Date(post.pubDate) > lastDateNumber) {
      return true;
    }
    return false;
  });
  return newPosts;
};

const fetchDataAuto = (store, link, lastDataArg) => {
  let lastDateNumber = null;
  let newPosts = [];
  axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
    .then((response) => {
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
      if (data.length !== 0) { // посты есть
        newPosts = (pickOnlyNewPosts(data, lastDataArg)).reverse();
        if (newPosts.length !== 0) { // есть новые данные
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
        setTimeout(() => fetchDataAuto(store, link, lastDateNumber), 5000); // id === indexArr
    });
};

const fetchData = (store, link) => { // они должны просто заполнять нужный store
  const feedback = document.querySelector('#form-result');

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
    .then((data) => [...data.querySelectorAll('item')].map((nodeItem) => ({
      title: nodeItem.querySelector('title').innerHTML,
      description: nodeItem.querySelector('description').innerHTML,
      link: nodeItem.querySelector('link').innerHTML,
      pubDate: nodeItem.querySelector('pubDate').innerHTML,
    })))
    .then((posts) => {
      store.links.push(link);
      store.posts.push(...posts.reverse());
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
      feedback.textContent = i18next.t('doesentVolidRSS');
      console.error(error);
    })
    .finally(() => {
      const submitButton = document.querySelector('#send');
      submitButton.disabled = false;
    });
};

export default fetchData;
