FROM docker.io/node:16 as build
COPY package.json .
COPY package-lock.json .
COPY src/ src/
RUN npm ci
ENV LIBRE_WEATHER_API='https://api.libreweather.com/weather'

RUN npm run build

FROM docker.io/node:16 as run
RUN npm i -g serve@14.1.2
COPY --from=build dist/ dist/
COPY app.sh app.sh

CMD ["sh", "app.sh"]

