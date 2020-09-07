import React from 'react';

const CurrentDayContext = React.createContext({
  sunrise: 0,
  sunset: 0,
  time: 0,
});

export default CurrentDayContext;
