export const getDateFromString = (str) => {
  str = str.replace(' ', '').split('.');
  const day = parseInt(str[0]);
  const month = parseInt(str[1]) - 1;
  const year = parseInt(str[2]);
  return new Date(year, month, day);
};

export const getValueOrEmptyString = (item) => {
  try {
    return item();
  } catch (e) {
    return '';
  }
}
