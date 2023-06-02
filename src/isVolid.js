import * as yup from 'yup';

const isVolid = (rss) => {

  // Создаем схему Yup для валидации RSS
  const rssSchema = yup.string().url().required().matches(/\.xml$/);

  // Возвращаем новый промис, который выполняет валидацию
  return new Promise((resolve, reject) => {
    // Используем метод isValid() схемы Yup для валидации переданного RSS
    rssSchema
      .isValid(rss)
      .then((volid) => {
        // Если валидация успешна, разрешаем промис с булевым значением volid
        resolve(volid);
      })
      .catch((error) => {
        // Если возникает ошибка, отклоняем промис с соответствующей ошибкой
        reject(error);
      });
  });
}

export default isVolid;
