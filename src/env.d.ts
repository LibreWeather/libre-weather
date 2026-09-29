declare namespace NodeJS {
  interface ProcessEnv {
    LIBRE_WEATHER_API?: string;
    NODE_ENV?: string;
    PUBLIC_URL?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
