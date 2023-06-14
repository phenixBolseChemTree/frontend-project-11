import axios from 'axios';
import onChange from 'on-change';
import parser from './parserRSS.js';

const store = {}; // Хранилище результатов парсера для каждого id

const render = (rssData) => {
  const containerList = document.querySelector('.container-list');

  // Функция для обработки каждого элемента RSS-данных
  const processRssItem = ({ id, link }) => {
    const existingElement = Array.from(containerList.children).find((element) => element.querySelector('p').textContent === `volid: ${link}`);

    // Если элемент не существует, создаем его
    if (!existingElement) {
      const div = document.createElement('div'); // блок для заполнения
      div.id = id;
      div.classList.add('container', 'w-100', 'bg-secondary', 'rounded', 'text-info', 'p-4', 'mb-4');

      const fetchData = () => {
        axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
          .then((response) => {
            if (response.status === 200) {
              const data = parser(response);
              const previousData = store[id]; // Получаем предыдущие результаты парсера по id
              console.log('previousData :', previousData);
              console.log('data :', data);
              console.log(store);

              const title = data.querySelector('title');
              const description = data.querySelector('description');

              const titleCopy = document.createElement('p');
              titleCopy.textContent = `Title: ${title.textContent}`;

              const descriptionCopy = document.createElement('p');
              descriptionCopy.textContent = `Description: ${description.textContent}`;

              // div.appendChild(innerDiv);
              // нужно убирать все содержимое div
              div.innerHTML = '';
              containerList.appendChild(div);
              div.appendChild(titleCopy);
              div.appendChild(descriptionCopy);

              store[id] = data; // Обновляем результаты парсера в store по id
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
            setTimeout(fetchData, 5000);
          });
      };

      fetchData(); // Запускаем первый цикл получения данных при первой отправке
    }
  };

  const watchedRssData = onChange(rssData, (path, value) => {
    if (path === 'length') {
      rssData.forEach(processRssItem);
    }
    console.log('value in render', value);
  });

  watchedRssData.forEach(processRssItem);
};

export default render;
