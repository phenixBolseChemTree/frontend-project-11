import initContainer from './renderModule/initContainer.js';
import fetchData from './renderModule/fetchData.js';

const render = (store, link) => {
  if (!store.initContainer) {
    initContainer();
    store.initContainer = true;
  }

  fetchData(store, link);
};

export default render;
