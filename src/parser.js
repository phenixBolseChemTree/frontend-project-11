// const parser = (contents, auto = true) => {
//   const dom = new DOMParser();
//   const domXML = dom.parseFromString(contents, 'text/xml');
//   if (domXML.querySelector('parsererror')) {
//     throw new Error('ParserError');
//   }
//   const items = domXML.querySelectorAll('item');
//   if (auto) {
//     const link = domXML.querySelector('channel > link');
//     const title = domXML.querySelector('channel > title');
//     const description = domXML.querySelector('channel > description');
//     const feed = {
//       title: title.textContent,
//       description: description.textContent,
//     };

//     items.forEach((item) => {
//       const itemTitle = item.querySelector('title');
//       const itemLink = item.querySelector('link');
//       const itemDescription = item.querySelector('description');
//       const post = {
//         title: itemTitle.textContent,
//         description: itemDescription.textContent,
//         link: itemLink.textContent,
//       };
//       data.posts.push(post);
//     });

//     const posts = (data) => [...data.querySelectorAll('item')].map((nodeItem) => ({
//       title: nodeItem.querySelector('title').innerHTML,
//       description: nodeItem.querySelector('description').innerHTML,
//       link: nodeItem.querySelector('link').innerHTML,
//       pubDate: nodeItem.querySelector('pubDate').innerHTML,
//     }));
//     return { feed, link, posts };
//   }
//   const posts = [...items.querySelectorAll('item')].map((nodeItem) => ({
//     title: nodeItem.querySelector('title').innerHTML,
//     description: nodeItem.querySelector('description').innerHTML,
//     link: nodeItem.querySelector('link').innerHTML,
//     pubDate: nodeItem.querySelector('pubDate').innerHTML,
//     return { posts };
//   }));
// };

// export default parser;
