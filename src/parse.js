const getId = (() => {
  let id = -1;
  return () => {
    id += 1;
    return id;
  };
})();

const parser = (response) => {
  const domParser = new DOMParser();
  const parsed = domParser.parseFromString(response.data.contents, 'application/xml');
  if (parsed.querySelector('parsererror')) {
    return 'invalidRSS';
  }
  const title = parsed.querySelector('title').textContent;
  const description = parsed.querySelector('description').textContent;
  const postsReverse = [...parsed.querySelectorAll('item')].reverse().map((nodeItem) => ({
    title: nodeItem.querySelector('title').innerHTML,
    description: nodeItem.querySelector('description').innerHTML,
    link: nodeItem.querySelector('link').innerHTML,
    pubDate: nodeItem.querySelector('pubDate').innerHTML,
    id: getId(),
  }));
  const posts = postsReverse.reverse();
  return { title, description, posts };
};

export default parser;
