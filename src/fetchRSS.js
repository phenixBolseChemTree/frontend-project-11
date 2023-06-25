import axios from 'axios';

const fetchRSS = (link) => axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`);

export default fetchRSS;
