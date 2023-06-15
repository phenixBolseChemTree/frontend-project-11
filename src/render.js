import axios from 'axios';
import onChange from 'on-change';
import parser from './parserRSS.js';

// const domParser = new DOMParser();
const store = {}; // Хранилище результатов парсера для каждого обьекта с item

const render = (rssData) => {
  const containerList = document.querySelector('.container-list');

  // Функция для обработки каждого элемента RSS-данных
  const processRssItem = ({ id, link }) => {
    const existingElement = Array.from(containerList.children).find((element) => element.querySelector('p').textContent === `volid: ${link}`);

    if (!existingElement) {
      const div = document.createElement('div'); // блок для заполнения
      div.id = id;
      div.classList.add('container', 'w-100', 'bg-secondary', 'rounded', 'text-info', 'p-4', 'mb-4');

      const fetchData = () => {
        axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
          .then((response) => { // проверка на удачный response
            if (response.status === 200) {
              console.log('good');
              const domXML = parser(response);
              return domXML;
            }
          })
          .then((data) => [...data.querySelectorAll('item')].map((nodeItem) => ({ // вывод сортированных значений
            title: nodeItem.querySelector('title').innerHTML,
            description: nodeItem.querySelector('description').innerHTML,
            link: nodeItem.querySelector('link').innerHTML,
            pubDate: nodeItem.querySelector('pubDate').innerHTML,
          })))
          .then((list) => {
            console.log('list', list);
            store[id] = list;
            console.log(store);
          })
          .catch((error) => {
            console.error(error);
          });
      };

      fetchData(); // Запускаем первый цикл получения данных при первой отправке
    }
    //---
    // const lastPubDate = store[id][0].pubDate;

    const pickOnlyNewPosts = (posts, lastPubDate) => {
      const newPosts = posts.filter((post) => {
        if (new Date(post.pubDate) > new Date(lastPubDate)) {
          return true;
        }
        return false;
      });
      return newPosts;
    };

    const pickOnlyOldPosts = (posts, lastPubDate) => {
      const oldPosts = posts.filter((post) => {
        if (new Date(post.pubDate) <= new Date(lastPubDate)) {
          return true;
        }
        return false;
      });
      return oldPosts;
    };
    //---
    const fetchDataAuto = () => {
      console.log('работа автомата');
      axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
        .then((response) => { // проверка на удачный response
          if (response.status === 200) {
            console.log('good');
            const domXML = parser(response);
            return domXML;
          }
        })
        .then((data) => [...data.querySelectorAll('item')].map((nodeItem) => ({ // вывод сортированных значений
          title: nodeItem.querySelector('title').innerHTML,
          description: nodeItem.querySelector('description').innerHTML,
          link: nodeItem.querySelector('link').innerHTML,
          pubDate: nodeItem.querySelector('pubDate').innerHTML,
        })))
        .then((data) => {
          const lastPubDate = store[id][0].pubDate;
          const newPosts = pickOnlyNewPosts(data, lastPubDate);
          const oldPosts = pickOnlyOldPosts(store[id], lastPubDate);
          store[id] = [...newPosts, ...oldPosts];
          console.log('data from fetchDataAuto: ', data);
          console.log('!!!(store[id][0].pubDate): ', store[id][0].pubDate);
        })
        .then(() => console.log('store from fetchDataAuto:', store))
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setTimeout(fetchDataAuto, 5000);
        });
    };
    setTimeout(fetchDataAuto, 5000);
  };// важная для id скобка

  const watchedRssData = onChange(rssData, (path) => {
    if (path === 'length') {
      rssData.forEach(processRssItem);
    }
  });

  watchedRssData.forEach(processRssItem);
};

export default render;
