FROM docker.io/node:20-alpine AS build
# dependencies
COPY package.json .
COPY package-lock.json .

#config files
COPY .browserslistrc .
COPY .babelrc.json .

# source code
COPY src/ src/

RUN npm ci
ENV LIBRE_WEATHER_API='https://api.libreweather.com/weather'
ENV NODE_ENV='production'

RUN npm run build

FROM docker.io/node:20-alpine AS run
RUN npm i -g serve@14.1.2
COPY --from=build dist/ dist/
COPY app.sh app.sh

LABEL org.opencontainers.image.description="LibreWeather Frontend Application"
LABEL org.opencontainers.image.source=https://github.com/libreweather/libre-weather
LABEL org.opencontainers.image.licenses=AGPL-3.0

CMD ["sh", "app.sh"]

