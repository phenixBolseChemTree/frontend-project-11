const parserV2 = (response) => { // потом долавим флаг означабщий поверение для 1 запросса и нет
  const domParser = new DOMParser();
  const parsed = domParser.parseFromString(response.data.contents, 'application/xml');
  if (parsed.querySelector('parsererror')) {
    return 'invalidRSS';
  }
  const title = parsed.querySelector('title').textContent;
  const description = parsed.querySelector('description').textContent;
  const posts = [...parsed.querySelectorAll('item')].map((nodeItem) => ({
    title: nodeItem.querySelector('title').innerHTML,
    description: nodeItem.querySelector('description').innerHTML,
    link: nodeItem.querySelector('link').innerHTML,
    pubDate: nodeItem.querySelector('pubDate').innerHTML,
  }));
  return { title, description, posts };
};

const pickOnlyNewPosts = (posts, lastDateNumber) => {
  const newPosts = posts.filter((post) => {
    if (new Date(post.pubDate) > lastDateNumber) {
      return true;
    }
    return false;
  });
  return newPosts;
};

export { pickOnlyNewPosts, parserV2 };
