import { HttpRequestBackend } from './backend';
import { HttpRequestOptions } from './options';
import { HttpRequest } from './http-request';
import { Middleware } from './middleware';
import { expect } from 'vitest';

interface MockResponse {
  request: HttpRequestOptions;
  response: string;
}
class MockBackend implements HttpRequestBackend {
  dispatch<Response>(options: HttpRequestOptions): Promise<Response> {
    return Promise.resolve({
      request: options,
      response: 'response',
    }) as Promise<Response>;
  }
}

const makeHttpRequest = () => HttpRequest.from({ backend: new MockBackend() });

test('passes request through middlewares in order they are added but response flows through in reverse order', async () => {
  const makeMiddleware =
    (index: number): Middleware<HttpRequestOptions, MockResponse> =>
    (context, next) =>
      next({
        ...context,
        body: (context.body as string) + index,
      }).then((response) => ({
        ...response,
        response: response.response + index,
      }));

  const httpRequest = makeHttpRequest().use(
    makeMiddleware(1),
    makeMiddleware(2),
    makeMiddleware(3)
  );

  const response = await httpRequest.dispatch({ url: 'test', body: 'request' });

  expect(response).toEqual({
    request: {
      url: 'test',
      body: 'request123',
    },
    response: 'response321',
  });
});

test('passes through error and throws the result', async () => {
  const makeErrorMiddleware =
    (index: number): Middleware<Error, Error> =>
    (error, next) => {
      error.message = error.message + index;
      return next(error);
    };

  const httpRequest = makeHttpRequest()
    .use((context, next) => {
      throw new Error('');
    })
    .useErrorHandler(
      makeErrorMiddleware(1),
      makeErrorMiddleware(2),
      makeErrorMiddleware(3)
    );

  const result = await httpRequest.dispatch({ url: '' });

  expect(httpRequest.dispatch({ url: '' })).rejects.toThrow('123321');
});
