import axios from 'axios';
import parser from './parserRSS.js';

const render = (rssData) => {
  const containerList = document.querySelector('.container-list');

  rssData.forEach(({ id, link }) => {
    const existingElement = Array.from(containerList.children).find((element) => element.querySelector('p').textContent === `volid: ${link}`);

    if (!existingElement) {
      const div = document.createElement('div');
      div.id = id;
      div.classList.add('container', 'w-100');

      const innerDiv = document.createElement('div');
      innerDiv.classList.add('bg-secondary', 'rounded', 'text-info', 'p-4', 'mb-4');

      // Выполняем парсинг RSS
      axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
        .then((response) => {
          if (response.status === 200) {
            const data = parser(response);
            const title = data.querySelector('title');
            const description = data.querySelector('description');

            const pParsedTitle = document.createElement('p');
            pParsedTitle.textContent = `Title: ${title.textContent}`;

            const pParsedDescription = document.createElement('p');
            pParsedDescription.textContent = `Description: ${description.textContent}`;

            div.appendChild(innerDiv);
            containerList.appendChild(div);
            innerDiv.appendChild(pParsedTitle);
            innerDiv.appendChild(pParsedDescription);
          }
        })
        .catch((error) => {
          console.error(error);
          alert('An error occurred while parsing the RSS data');
          // showErrorMessage(innerDiv);
        });
    }
  });
};

export default render;
