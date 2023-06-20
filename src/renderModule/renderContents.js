const renderFeed = (feed) => { // ноучить принимать 1 эл а не все сразу
  const containerFeeds = document.querySelector('.list-group');
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

  const renderPosts = (posts) => { // нахожу тег с моим id и туда все добавляю
  const container = document.querySelector('.container-list');
  const flattenedPosts = posts.flat(); // Преобразование в одномерный массив
  flattenedPosts.forEach((item) => {
    const { title, link, description } = item;
    const titleTag = document.createElement('a');
    titleTag.textContent = title;
    titleTag.setAttribute('href', link);
    titleTag.setAttribute('target', '_blank');
    titleTag.addEventListener('click', () => {
      titleTag.style.color = 'gray'; // Изменяем цвет ссылки на серый
    });

    const descriptionTag = document.createElement('p');
    descriptionTag.textContent = description;

    const li = document.createElement('li');
    li.classList.add('container', 'w-100', 'rounded', 'p-2', 'mb-2', 'border', 'list-unstyled');
    li.appendChild(titleTag);
    li.appendChild(descriptionTag);

    container.prepend(li);
  });
};

export { renderFeed, renderPosts };
