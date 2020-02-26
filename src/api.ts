import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export class Api {
  private readonly routes: ApiRoutes = {
    GET: {},
    POST: {},
    PUT: {},
    PATCH: {},
    DELETE: {},
    OPTIONS: {},
    HEAD: {}
  };

  private readonly config: ApiConfig;
  private eventHandler: EventRequest<any, any> = () => ({});

  constructor(options: ApiConfig) {
    const defaultOptions: ApiConfig = {
      defaultHeaders: {
        'content-type': 'application/json'
      }
    };
    this.config = {
      defaultHeaders: {
        ...defaultOptions.defaultHeaders,
        ...options.defaultHeaders
      }
    };
  }

  public addRoute(method: ApiMethods, route: string, func: ApiRequest): void {
    this.routes[method][route] = func;
  }

  public get(path: string, func: ApiRequest): void {
    this.addRoute('GET', path, func);
  }

  public post(path: string, func: ApiRequest): void {
    this.addRoute('POST', path, func);
  }

  public put(path: string, func: ApiRequest): void {
    this.addRoute('PUT', path, func);
  }

  public patch(path: string, func: ApiRequest): void {
    this.addRoute('PATCH', path, func);
  }

  public delete(path: string, func: ApiRequest): void {
    this.addRoute('DELETE', path, func);
  }

  public options(path: string, func: ApiRequest): void {
    this.addRoute('OPTIONS', path, func);
  }

  public head(path: string, func: ApiRequest): void {
    this.addRoute('HEAD', path, func);
  }

  private notFound(event: APIGatewayEvent): ApiResponse {
    return {
      statusCode: 404,
      body: {
        message: `No handler found for ${event.httpMethod} ${event.path}`
      }
    };
  }

  public handleEvent<EventType = any, EventResult = any>(func: EventRequest<EventType, EventResult>): void {
    this.eventHandler = func;
  }

  private exec(event: APIGatewayEvent, context: Context): Promise<any> {
    if (event.httpMethod && event.path) {
      return this.execHttp(event, context);
    }

    return this.execEvent(event, context);
  }

  private async execHttp(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
    try {
      const func = this.routes[event.httpMethod as ApiMethods][event.path] ?? this.routes[event.httpMethod as ApiMethods]['*'] ?? this.notFound;
      const result = await func(event, context);

      return {
        statusCode: result.statusCode,
        body: JSON.stringify(result.body ?? {}),
        headers: {
          ...this.config.defaultHeaders,
          ...result.headers
        }
      };
    } catch (error) {
      console.error(error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Something went wrong...'
        })
      };
    }
  }

  private async execEvent(event: object, context: Context): Promise<any> {
    const result = await this.eventHandler(event, context);

    return JSON.stringify(result);
  }

  get handler(): (event: APIGatewayEvent, context: Context) => Promise<any> {
    return (event, context): Promise<any> => this.exec(event, context);
  }
}

export type ApiRequest = ((event: APIGatewayEvent, context: Context) => ApiResponse) | ((event: APIGatewayEvent, context: Context) => Promise<ApiResponse>);
export type EventRequest<E, R> = ((event: E, context: Context) => R) | ((event: E, context: Context) => Promise<R>);

type ApiRequestMap = Record<string, ApiRequest>;

type ApiMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

type ApiRoutes = {[method in ApiMethods]: ApiRequestMap};

export interface ApiResponse<T = unknown> {
  statusCode: number;
  headers?: Record<string, string>;
  body?: T | ApiResponseDefault;
}

interface ApiResponseDefault {
  message: string;
}

export interface ApiConfig {
  defaultHeaders?: Record<string, string>;
}
