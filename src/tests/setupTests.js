import { TextDecoder, TextEncoder } from 'node:util';
import '@testing-library/jest-dom';

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;
process.env.LIBRE_WEATHER_API ??= 'https://example.test/weather';

if (typeof window !== 'undefined') {
  window.fetch = () => Promise.reject(new Error('offline'));
  window.matchMedia ??= (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
  });
  HTMLCanvasElement.prototype.getContext = () => ({
    canvas: {},
    fillRect() {},
    clearRect() {},
    getImageData() {
      return { data: [] };
    },
    putImageData() {},
    createImageData() {
      return [];
    },
    setTransform() {},
    drawImage() {},
    save() {},
    fillText() {},
    restore() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    stroke() {},
    translate() {},
    scale() {},
    rotate() {},
    arc() {},
    fill() {},
    measureText() {
      return { width: 0 };
    },
    transform() {},
    rect() {},
    clip() {},
  });
}
