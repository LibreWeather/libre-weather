import React from 'react';

import type { CurrentDay } from '@/models/weather';

const CurrentDayContext = React.createContext<CurrentDay>({
  sunrise: 0,
  sunset: 0,
  time: 0,
});

export default CurrentDayContext;
