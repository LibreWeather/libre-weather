import React from 'react';

export type CurrentDay = {
  sunrise: number;
  sunset: number;
  time: number;
};

const CurrentDayContext = React.createContext<CurrentDay>({
  sunrise: 0,
  sunset: 0,
  time: 0,
});

export default CurrentDayContext;
