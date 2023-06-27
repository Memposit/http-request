import { HttpRequestOptions } from './options';
import { HttpRequestBackend } from './backend';
import {
  DefaultMiddlewareManager,
  Middleware,
  MiddlewareManager,
} from './middleware';

interface HttpRequestMakeOptions {
  backend: HttpRequestBackend;
}

export class HttpRequest {
  private constructor(
    private backend: HttpRequestBackend,
    private middlewareManager: MiddlewareManager<HttpRequestOptions>,
    private errorHandlerManager: MiddlewareManager<unknown>
  ) {}

  use(...middlewares: Middleware<HttpRequestOptions, any>[]): this {
    this.middlewareManager.use(...middlewares);
    return this;
  }

  useErrorHandler(...errorHandlers: Middleware<any, any>[]): this {
    this.errorHandlerManager.use(...errorHandlers);
    return this;
  }

  async dispatch<Response>(options: HttpRequestOptions): Promise<Response> {
    try {
      return this.middlewareManager.run<Response>(options, (context) =>
        this.backend.dispatch(context)
      );
    } catch (e) {
      throw await this.errorHandlerManager.run(e);
    }
  }

  static from({ backend }: HttpRequestMakeOptions): HttpRequest {
    return new HttpRequest(
      backend,
      new DefaultMiddlewareManager(),
      new DefaultMiddlewareManager()
    );
  }
}
