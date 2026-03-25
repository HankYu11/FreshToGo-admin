import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Helper to access interceptor handlers from an axios instance
function getRequestInterceptor(instance: ReturnType<typeof axios.create>) {
  return (instance.interceptors.request as unknown as {
    handlers: Array<{ fulfilled: (c: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }>;
  }).handlers[0];
}

function getResponseErrorHandler(instance: ReturnType<typeof axios.create>) {
  return (instance.interceptors.response as unknown as {
    handlers: Array<{ rejected: (e: unknown) => Promise<unknown> }>;
  }).handlers[0].rejected;
}

describe('api interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('request interceptor attaches Bearer token', async () => {
    localStorage.setItem('access_token', 'mytoken');
    vi.resetModules();
    const { default: api } = await import('./api');
    const config = { headers: new axios.AxiosHeaders() } as InternalAxiosRequestConfig;
    const result = getRequestInterceptor(api).fulfilled(config);
    expect(result.headers.Authorization).toBe('Bearer mytoken');
  });

  it('no header when no token', async () => {
    vi.resetModules();
    const { default: api } = await import('./api');
    const config = { headers: new axios.AxiosHeaders() } as InternalAxiosRequestConfig;
    const result = getRequestInterceptor(api).fulfilled(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('401 triggers refresh, retries with new token', async () => {
    localStorage.setItem('access_token', 'old');
    localStorage.setItem('refresh_token', 'refresh1');
    vi.resetModules();

    // Mock axios.post for the refresh call
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { accessToken: 'newtoken', refreshToken: 'newrefresh' },
    });

    const { default: api } = await import('./api');

    // Mock the default adapter so the retried api(originalRequest) doesn't hit network
    api.defaults.adapter = () => Promise.resolve({
      data: 'retried',
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });

    const handleError = getResponseErrorHandler(api);
    const error = {
      config: { headers: { Authorization: 'Bearer old' } },
      response: { status: 401 },
    };

    await handleError(error);
    expect(postSpy).toHaveBeenCalled();
    expect(localStorage.getItem('access_token')).toBe('newtoken');

    postSpy.mockRestore();
  });

  it('401 with no refresh token dispatches auth-failed event', async () => {
    localStorage.setItem('access_token', 'old');
    vi.resetModules();

    const { default: api } = await import('./api');
    const handleError = getResponseErrorHandler(api);

    const authFailedHandler = vi.fn();
    window.addEventListener('auth-failed', authFailedHandler);

    const error = {
      config: { headers: {} },
      response: { status: 401 },
    };

    await expect(handleError(error)).rejects.toBeDefined();
    expect(authFailedHandler).toHaveBeenCalledTimes(1);

    window.removeEventListener('auth-failed', authFailedHandler);
  });

  it('queues concurrent 401s, resolves after single refresh', async () => {
    localStorage.setItem('access_token', 'old');
    localStorage.setItem('refresh_token', 'refresh1');
    vi.resetModules();

    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { accessToken: 'newtoken' },
    });

    const { default: api } = await import('./api');

    api.defaults.adapter = () => Promise.resolve({
      data: 'ok',
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });

    const handleError = getResponseErrorHandler(api);

    const makeError = () => ({
      config: { headers: {} },
      response: { status: 401 },
    });

    await Promise.all([
      handleError(makeError()),
      handleError(makeError()),
    ]);

    expect(postSpy).toHaveBeenCalledTimes(1);
    postSpy.mockRestore();
  });
});
