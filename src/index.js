import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import render from './render.js';

const rssLinks = [];
const rssSchema = yup.string().url().required().matches(/\.rss$/);
const form = document.querySelector('form');
const input = form.querySelector('#query');
const isSubmit = false; // нужен для отслеживания если input имеет класс is-invalid

input.addEventListener('input', (event) => {
  rssSchema.validate(event.target.value)
    .then(() => {
      input.classList.remove('is-invalid');
    })
    .catch(() => {
      if (isSubmit) {
        input.classList.add('is-invalid');
      }
    });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  formData.forEach((value, name) => {
    if (name === 'query') {
      rssSchema.validate(value)
        .then((resolve) => {
          if (!rssLinks.includes(resolve)) {
            input.classList.remove('is-invalid');
            rssLinks.push(resolve);
            render(resolve);
            console.log(rssLinks);
            event.target.reset();
            input.focus();
          } else {
            console.log(rssLinks);
            input.classList.add('is-invalid');
          }
        })
        .catch(() => {
          console.log('идет плохой сценарий');
          input.classList.add('is-invalid');
        });
    }
  });
});
