const descriptionData = {};
let id = 0;

// для кажной кнопки нужно сделать возможность вызвать модальное окно

const renderFeed = (feed) => { // ноучить принимать 1 эл а не все сразу
  const containerFeeds = document.querySelector('.container-feeds');
  const { title, description } = feed;
  const titleTeg = document.createElement('h3');
  titleTeg.classList.add('h6', 'm-0');
  titleTeg.textContent = title;

  const descriptionTag = document.createElement('p');
  descriptionTag.classList.add('m-0', 'small', 'text-black-50');
  descriptionTag.textContent = description;

  const liTag = document.createElement('li');
  liTag.classList.add('list-group-item', 'border-0', 'border-end-0');

  liTag.appendChild(titleTeg);
  liTag.appendChild(descriptionTag);

  containerFeeds.prepend(liTag);
  };

  // можно создавать id для description и передавать его и при этом
  // реализовать добавление description с нужным id через push
  const renderPosts = (posts) => {
    const container = document.querySelector('.container-list');
    const flattenedPosts = posts.flat();

    flattenedPosts.forEach((item) => {
      const { title, link, description } = item;

      const titleTag = document.createElement('a');
      const descriptionTag = document.createElement('button');
      const curId = id;

      titleTag.textContent = title;
      titleTag.setAttribute('href', link);
      titleTag.setAttribute('target', '_blank');
      descriptionTag.textContent = 'Просмотр';

      if (descriptionData[id]?.read) {
        titleTag.classList.add('fw-normal', 'text-secondary');
      } else {
        titleTag.classList.add('fw-bold');
      }

      const handleClick = () => {
        titleTag.classList.remove('fw-bold');
        titleTag.classList.add('fw-normal', 'text-secondary');
      };

      titleTag.addEventListener('click', handleClick);
      descriptionTag.addEventListener('click', handleClick);

      descriptionTag.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      descriptionTag.setAttribute('data-id', curId);
      descriptionTag.setAttribute('data-bs-toggle', 'modal');
      descriptionTag.setAttribute('data-bs-target', '#modal');
      descriptionData[id] = { title, description, link };
      id += 1;

      descriptionTag.addEventListener('click', () => {
        const curId = descriptionTag.getAttribute('data-id');
        const { title, description, link } = descriptionData[curId];

        const modalTitle = document.querySelector('.modal-title');
        const modalBody = document.querySelector('.modal-body');
        const fullArticleLink = document.querySelector('.full-article');

        modalTitle.textContent = title;
        modalBody.textContent = description;
        fullArticleLink.setAttribute('href', link);

        descriptionData[curId].read = true;
        titleTag.classList.remove('fw-bold');
        titleTag.classList.add('fw-normal', 'text-secondary');
      });

      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      li.appendChild(titleTag);
      li.appendChild(descriptionTag);

      container.prepend(li);
    });
  };

export { renderFeed, renderPosts };
