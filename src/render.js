import initData from './renderModule/initData.js';
import fetchData from './renderModule/fetchData.js';

let isInitDataCalled = false; // Флаг для отслеживания вызова initData

const render = (store, link) => {
  if (!isInitDataCalled) {
    initData();
    isInitDataCalled = true; // Устанавливаем флаг, чтобы initData больше не вызывалась
  }

  fetchData(store, link); // задача этого кода просто заполнить store
};

export default render;
