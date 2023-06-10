const axios = require('axios');

// const getResultFeed = () => {
axios.get('http://lorem-rss.herokuapp.com/feed', {
  params: {
    unit: 'second',
    interval: 30,
    length: 10,
  },
})
  .then((response) => {
    // console.log(response.data); // Обрабатывайте полученные данные здесь
    const parser = new DOMParser();
    const data = parser.parseFromString(response.data, 'application/xml');
    const title = data.querySelector('title');
    const description = data.querySelector('description');
    console.log(title, description);
  })
  .catch((error) => {
    console.error(error);
  });
// };

// export default getResultFeed;
