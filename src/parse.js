const parser = (data) => {
  if (data.querySelector('parsererror')) {
    return 'invalidRSS';
  }
  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const postsReverse = [...data.querySelectorAll('item')].reverse().map((nodeItem) => ({
    title: nodeItem.querySelector('title').innerHTML,
    description: nodeItem.querySelector('description').innerHTML,
    link: nodeItem.querySelector('link').innerHTML,
    pubDate: nodeItem.querySelector('pubDate').innerHTML,
  }));
  const posts = postsReverse.reverse();
  return { title, description, posts };
};

export default parser;
