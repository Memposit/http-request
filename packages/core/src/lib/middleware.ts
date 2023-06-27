export interface MiddlewareHandler<Context, Result extends unknown = unknown> {
  (context: Context): Promise<Result>;
}

export interface Middleware<Context, Result> {
  (context: Context, next: MiddlewareHandler<Context, Result>): Promise<Result>;
}

export interface MiddlewareManager<Context> {
  use(...middlewares: Middleware<Context, unknown>[]): this;
  run<Result>(
    context: Context,
    done?: MiddlewareHandler<Context, Result>
  ): Promise<Result>;
}

export class DefaultMiddlewareManager<Context>
  implements MiddlewareManager<Context>
{
  private middlewares: Middleware<Context, unknown>[] = [];

  use(...middlewares: Middleware<Context, unknown>[]): this {
    this.middlewares.push(...middlewares);
    return this;
  }

  run<Result>(
    context: Context,
    done: MiddlewareHandler<Context, Result> = Promise.resolve
  ): Promise<Result> {
    if (!this.middlewares.length) {
      return done(context);
    }

    let index = 0;
    const next: MiddlewareHandler<Context, Result> = (handlerContext) => {
      index++;
      return this.middlewares[index](
        handlerContext,
        this.isLastMiddleware(index) ? done : next
      ) as Promise<Result>;
    };

    return this.middlewares[0](context, next) as Promise<Result>;
  }

  private isLastMiddleware(index: number): boolean {
    return index + 1 === this.middlewares.length;
  }
}
