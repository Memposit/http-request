import { HttpRequestOptions } from './options';

export interface HttpRequestBackend {
  dispatch<Response>(options: HttpRequestOptions): Promise<Response>;
}
