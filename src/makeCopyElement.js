import i18next from 'i18next';

const makeCopyElement = () => {
  const feedbackElement = document.querySelector('p.feedback');
  feedbackElement.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('https://ru.hexlet.io/lessons.rss');
      alert(`${i18next.t('copyElement')} https://ru.hexlet.io/lessons.rss`);
    } catch (error) {
      console.error('Ошибка при копировании в буфер обмена:', error);
    }
  });
};

export default makeCopyElement;
