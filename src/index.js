import './styles.scss';
import 'bootstrap';
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import i18nInit from './i18n';
import fetchRSS from './fetchRSS';
import { renderFeed, renderPosts, renderContainer } from './render';

const parser = (response) => {
  const domParser = new DOMParser();
  const parseData = domParser.parseFromString(response.data.contents, 'application/xml');
  return parseData;
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

i18nInit();

const initialStoreValues = {
  feed: [],
  posts: [],
  links: [],
  visitedPosts: [],
  feedback: null,
  isLoading: false,
  form: {
    isFormSubmitted: false,
    submittionError: null,
    validationError: null,
  },
  lastResponse: null,
};

const store = onChange(initialStoreValues, (path, value) => {
  if (path === 'feed') {
    renderFeed(value[value.length - 1]);
  }
  if (path === 'posts') {
    renderPosts(store);
  }

  if (path === 'form') {
    console.log('вызвалась форма');
  }

  if (path === 'feedback') {
    const formResultEl = document.querySelector('#form-result');

    const showFeedback = (text) => {
      if (text !== 'successfulScenario') {
        formResultEl.classList.add('text-danger');
        formResultEl.classList.remove('text-success');
      } else {
        formResultEl.classList.remove('text-danger');
        formResultEl.classList.add('text-success');
      }
      formResultEl.textContent = i18next.t(text);
    };
    showFeedback(value);
  }

  if (path === 'isLoading') {
    const btn = document.querySelector('.btn-primary');
    if (value === true) {
      btn.disabled = true;
    } else {
      btn.disabled = false;
    }
  }

  // // ВРЕМЕННО, КАК ЗАКОНЧУ УДАЛИТЬ

  const debugEl = document.querySelector('#debug');

  if (debugEl) {
    debugEl.innerHTML = JSON.stringify(store);
  }
});

const parseData = (data) => [...data.querySelectorAll('item')].map((nodeItem) => ({
  title: nodeItem.querySelector('title').innerHTML,
  description: nodeItem.querySelector('description').innerHTML,
  link: nodeItem.querySelector('link').innerHTML,
  pubDate: nodeItem.querySelector('pubDate').innerHTML,
}));

const fetchRSSAuto = (store, link, lastDataArg) => {
  let lastDateNumber = null;
  let newPosts = [];
  fetchRSS(link)
    .then((response) => {
      if (response.status === 200) {
        const domXML = parser(response);
        return domXML;
      }
    })
    .then((data) => parseData(data))
    .then((data) => { // массив всех постов из API
      if (data.length !== 0) { // посты есть
        newPosts = (pickOnlyNewPosts(data, lastDataArg)).reverse();
        if (newPosts.length !== 0) { // есть новые данные
          store.posts.push(...newPosts); // вот наша магия !!!!
          const currentlastData = (data[0]).pubDate; // данные есть новая дата
          lastDateNumber = Date.parse(currentlastData);
        } else {
          lastDateNumber = lastDataArg;
        }
      } else {
        lastDateNumber = lastDataArg;
      }
    })
    .finally(() => {
      setTimeout(() => fetchRSSAuto(store, link, lastDateNumber), 5000); // id === indexArr
    });
};

const rssSchema = yup.string().url().required();

const formElement = document.querySelector('form');
const queryElement = formElement.querySelector('#query');
// const btnPrimary = document.querySelector('.btn-primary');

queryElement.addEventListener('input', () => {
  // validateQuery(event.target.value);
});

const btnEl = document.querySelector('#send');

btnEl?.addEventListener('click', (event) => {
  event.preventDefault();
  // btnPrimary.disabled = true;
  store.isLoading = true;

  const query = document.querySelector('#query').value;

  const processRss = async (link) => {
    try {
      await rssSchema.validate(link);

      if (!store.links.includes(link)) {
        fetchRSS(link)
          .then((data) => {
            // store.lastResponse = JSON.stringxify(data);
            console.log(data);
            store.lastResponse = data;
            // JSON.stringify(data)

            const response = data?.data ? data.data : data;

            // store.lastResponse = { qwert: data, status: data?.status,  };
            // console.log(response);

            if (data.status === 200 || data?.status?.http_code === 200) { // проверка статус
              if (response?.status?.content_type === 'application/rss+xml; charset=utf-8' || response.status?.headers?.content_type === 'text/xml') {
                const domXML = parser(data);
                const title = domXML.querySelector('title').textContent;
                const description = domXML.querySelector('description').textContent;
                if (!store.feed.length) { // создает контейнер если нет постов
                  renderContainer();
                }
                store.feed.push({ title, description });

                store.links.push(link);

                const posts = parseData(domXML);

                store.posts.push(...posts.reverse());

                const lastData = (posts[posts.length - 1]).pubDate;
                const lastDateNumber = Date.parse(lastData);

                store.feedback = 'successfulScenario';
                setTimeout(() => fetchRSSAuto(store, link, lastDateNumber), 5000);
              } else {
                store.feedback = 'invalidRSS';
              }
            } else {
              store.feedback = 'invalidRSS';
            }
          })
          .finally(() => {
            // btnPrimary.disabled = false;
            // store.isLoading = false;
            queryElement.value = '';
          });
      } else {
        store.feedback = 'duplicateRSSlink';
      }
    } catch (error) {
      store.feedback = 'InvalidRSSlink';
    }

    store.isLoading = false;
  };

  processRss(query);
});
