import i18next from 'i18next';

const formController = (rssLinks, rssSchema, form, input, isSubmit, render) => {
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
              console.log(i18next.t('successfulScenario'));
              event.target.reset();
              input.focus();
            } else {
              console.log(i18next.t('duplicateRSSlink'));
              input.classList.add('is-invalid');
            }
          })
          .catch(() => {
            console.log(i18next.t('InvalidRSSlink'));
            input.classList.add('is-invalid');
          });
      }
    });
  });
};

export default formController;
