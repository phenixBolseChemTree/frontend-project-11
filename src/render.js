// import initContainer from './renderModule/initContainer.js';
import fetchData from "./fetchData.js";
import { renderContainer } from "./view.js";

const render = (store, link) => {
  if (!store.initContainer) {
    renderContainer();
    store.initContainer = true;
  }

  fetchData(store, link);
};

export default render;
