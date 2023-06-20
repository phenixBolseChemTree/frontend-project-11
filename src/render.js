import onChange from 'on-change';
import initData from './renderModule/initData.js';
import { renderFeed, renderPosts } from './renderModule/renderContents.js';
import { fetchDataStart, fetchDataAuto } from './renderModule/fetchData.js';

const initialStoreValues = {
  feed: [],
  posts: [],
};

let isInitDataCalled = false; // Флаг для отслеживания вызова initData

const store = onChange(initialStoreValues, (path, value, previousValue) => {
if (path === 'feed') {
  console.log('!!!Feed', value);
  renderFeed(value); // отображает новый фид на странице
  // создать обработчик для добавления данных
}
if (path === 'posts') {
  console.log('!!!Posts', value);
  renderPosts(value); // отображает посты на странице
}
});

const render = (link) => {
  if (!isInitDataCalled) {
    initData();
    isInitDataCalled = true; // Устанавливаем флаг, чтобы initData больше не вызывалась
  }

  fetchDataStart(store, link); // задача этого кода просто заполнить store
  // setTimeout(() => fetchDataAuto(store, link, previousValue), 5000);
};

export default render;
