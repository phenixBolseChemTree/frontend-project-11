const descriptionData = {};
let id = 0;

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
  const renderPosts = (posts) => { // нахожу тег с моим id и туда все добавляю
  const container = document.querySelector('.container-list');
  const flattenedPosts = posts.flat(); // Преобразование в одномерный массив
  flattenedPosts.forEach((item) => {
    const { title, link, description } = item;

    const titleTag = document.createElement('a');
    titleTag.textContent = title;
    titleTag.setAttribute('href', link);
    titleTag.setAttribute('target', '_blank');
    titleTag.classList.add('fw-bold');
    titleTag.addEventListener('click', () => {
      titleTag.style.color = 'gray'; // Изменяем цвет ссылки на серый
      titleTag.classList.remove('fw-bold');
      titleTag.classList.add('fw-normal');
    });

    // console.log('store.posts[id].description', store.posts[id].description);

    const descriptionTag = document.createElement('button');
    descriptionTag.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    const curId = id;
    // descriptionTag.setAttribute(`data-id=${curId}`);
    descriptionTag.setAttribute('data-id', curId);
    descriptionData[id] = { title, description }; // novi code
    id += 1;
    // descriptionTag.textContent = description;
    descriptionTag.textContent = 'Просмотр';

    const li = document.createElement('li');
    // li.classList.add('container', 'w-100', 'rounded', 'p-2', 'mb-2', 'border', 'list-unstyled');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    li.appendChild(titleTag);
    li.appendChild(descriptionTag);

    container.prepend(li);
    console.log('!!!descriptionData: ', descriptionData);
  });
};

export { renderFeed, renderPosts };
