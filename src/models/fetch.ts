/** What `useFetch` sends: a URL plus optional `fetch` options. */
export type FetchRequest = {
  url: string;
  init?: RequestInit;
  /** Shown in errors instead of `url`, so a secret in the path is not logged. */
  errorUrl?: string;
};
