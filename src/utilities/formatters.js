export const tempDisplay = (temp) => `${Math.round(temp.value)}${temp.unit === 'K' ? 'K' : '˚'}`;
export const timeDisplay = (time) => {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours % 12}:${minutes < 10 ? '0' : ''}${minutes}${hours < 12 ? 'am' : 'pm'}`;
};
export const volumeDisplay = (volume) => `${volume.value} ${volume.unit === 'IN' ? 'in' : 'mm'}`;
export const getDayOfTheWeek = (time) => {
  switch (new Date(time).getDay()) {
    case 0:
      return 'Sun';
    case 1:
      return 'Mon';
    case 2:
      return 'Tue';
    case 3:
      return 'Wed';
    case 4:
      return 'Thu';
    case 5:
      return 'Fri';
    default:
      return 'Sat';
  }
};
