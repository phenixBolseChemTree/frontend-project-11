import i18next from 'i18next';

const renderContainer = () => {
  const postsEl = document.querySelector('.posts');
  const feedsEl = document.querySelector('.feeds');

const postsContent = `
  <div class="card border-0">
  <div class="card-body">
    <h2 class="lng-posts card-title h4">${i18next.t('posts')}</h2>
    </div>
  </div>
  <ul class="container-list list-group border-0 rounded-0"></ul>
`;

const feedsContent = `
  <div class="card border-0">
    <div class="card-body">
      <h2 class="lng-feeds card-title h4">${i18next.t('feeds')}</h2>
      <ul class="container-feeds list-group border-0 rounded-0"></ul>
    </div>
  </div>
`;

postsEl.innerHTML = postsContent;
feedsEl.innerHTML = feedsContent;
};

const renderFeed = (feed) => {
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

  const renderPosts = (store) => {
    const container = document.querySelector('.container-list');
    container.innerHTML = '';
    store.posts.forEach((item, index) => {
      const { title, link } = item; // description тут пока что не нужен

      // формируем данные title
      const titleTag = document.createElement('a');
      titleTag.textContent = title;
      titleTag.setAttribute('href', link);
      titleTag.setAttribute('target', '_blank');

      // формируем данные description
      const descriptionTag = document.createElement('button');
      descriptionTag.textContent = 'Просмотр';
      if (store.openPosts.includes(index)) {
        titleTag.classList.add('fw-normal', 'text-secondary');
      } else {
        titleTag.classList.add('fw-bold');
      }

      const handleClick = () => { // позволяет сделать ссылку серой
        titleTag.classList.remove('fw-bold');
        titleTag.classList.add('fw-normal', 'text-secondary');
      };

      titleTag.addEventListener('click', () => {
        store.openPosts.push(index);
      });

      titleTag.addEventListener('click', handleClick);
      descriptionTag.addEventListener('click', handleClick);

      descriptionTag.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      descriptionTag.setAttribute('data-id', index); // для выбора description
      descriptionTag.setAttribute('data-bs-toggle', 'modal');
      descriptionTag.setAttribute('data-bs-target', '#modal');
      // store.openPosts.push(index);

      descriptionTag.addEventListener('click', () => {
        const id = descriptionTag.getAttribute('data-id');
        const { title, description, link } = store.posts[id]; // тут берет значение а так не надо

        const modalTitle = document.querySelector('.modal-title');
        const modalBody = document.querySelector('.modal-body');
        const fullArticleLink = document.querySelector('.full-article');

        modalTitle.textContent = title;
        modalBody.textContent = description;
        fullArticleLink.setAttribute('href', link);

        store.openPosts.push(index);
        titleTag.classList.remove('fw-bold');
        titleTag.classList.add('fw-normal', 'text-secondary');
      });

      const li = document.createElement('li');
      li.classList.add(
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'align-items-start',
        'border-0',
        'border-end-0',
      );
      li.appendChild(titleTag);
      li.appendChild(descriptionTag);

      container.prepend(li);
    });
  };
  export { renderContainer, renderFeed, renderPosts };
