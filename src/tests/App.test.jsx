import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

require('dotenv').config();

test('env is populated', () => expect(process.env.LIBRE_WEATHER_API).not.toBeFalsy());

test('renders learn react link', () => {
  render(<App />);
  expect(screen.getByText(/Libre Weather/i)).toBeInTheDocument();
});
