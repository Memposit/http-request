export type HttpRequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options';

export interface HttpRequestOptions<Body = unknown> {
  url: string | URL;
  method?: HttpRequestMethod;
  contentType?: string;
  body?: Body;
}
