const parser = (dataStr) => {
  const dataObj = JSON.parse(dataStr);
  const domParser = new DOMParser();
  const data = domParser.parseFromString(dataObj.data.contents, 'application/xml');
  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const postsReverse = [...data.querySelectorAll('item')].reverse().map((nodeItem) => ({
    title: nodeItem.querySelector('title').textContent,
    description: nodeItem.querySelector('description').textContent,
    link: nodeItem.querySelector('link').textContent,
    pubDate: nodeItem.querySelector('pubDate').textContent,
  }));
  const posts = postsReverse.reverse();
  return { title, description, posts };
};

export default parser;
