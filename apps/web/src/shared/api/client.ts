type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiResponse<T = any> = {
  data: T;
  status: number;
  headers: Headers;
};

export type RequestConfig = {
  headers?: Record<string, string>;
  _retry?: boolean;
};

export class ApiError<T = any> extends Error {
  response: {
    status: number;
    data: T;
  };

  constructor(message: string, status: number, data: T) {
    super(message);
    this.name = 'ApiError';
    this.response = { status, data };
  }
}

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api/v1';

const resolveUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;
  const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

const parseResponse = async (response: Response): Promise<any> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const buildHeaders = (customHeaders?: Record<string, string>): Headers => {
  const headers = new Headers(customHeaders);
  const tenantId = localStorage.getItem('tenantId');
  const token = localStorage.getItem('accessToken');

  if (tenantId) {
    headers.set('x-tenant-id', tenantId);
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
};

const redirectToLogin = (): void => {
  localStorage.clear();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

type RefreshResponse = {
  accessToken?: string;
};

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(resolveUrl('/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) return false;

    const data = (await parseResponse(response)) as RefreshResponse | null;
    if (!data?.accessToken) return false;

    localStorage.setItem('accessToken', data.accessToken);
    return true;
  } catch {
    return false;
  }
};

const createRequestBody = (payload: any, headers: Headers): BodyInit | undefined => {
  if (payload === undefined || payload === null) return undefined;

  if (payload instanceof FormData) {
    // Let the browser set the multipart boundary automatically.
    headers.delete('Content-Type');
    return payload;
  }

  if (typeof payload === 'string' || payload instanceof Blob || payload instanceof URLSearchParams) {
    return payload;
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return JSON.stringify(payload);
};

const request = async <T>(
  method: HttpMethod,
  path: string,
  payload?: any,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> => {
  const headers = buildHeaders(config.headers);
  const response = await fetch(resolveUrl(path), {
    method,
    headers,
    credentials: 'include',
    body: method === 'GET' || method === 'DELETE' ? undefined : createRequestBody(payload, headers),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const hasToken = Boolean(localStorage.getItem('accessToken'));
    const shouldTryRefresh =
      response.status === 401 && !config._retry && hasToken && !path.endsWith('/auth/refresh');

    if (shouldTryRefresh) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request<T>(method, path, payload, { ...config, _retry: true });
      }
      redirectToLogin();
    }

    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error?: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `Erreur HTTP ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return {
    data: data as T,
    status: response.status,
    headers: response.headers,
  };
};

const api = {
  get: <T = any>(path: string, config?: RequestConfig) => request<T>('GET', path, undefined, config),
  post: <T = any>(path: string, payload?: any, config?: RequestConfig) =>
    request<T>('POST', path, payload, config),
  put: <T = any>(path: string, payload?: any, config?: RequestConfig) =>
    request<T>('PUT', path, payload, config),
  patch: <T = any>(path: string, payload?: any, config?: RequestConfig) =>
    request<T>('PATCH', path, payload, config),
  delete: <T = any>(path: string, config?: RequestConfig) =>
    request<T>('DELETE', path, undefined, config),
};

export default api;
