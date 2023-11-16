import config from '../config';

export const LOGIN_URL = '/auth/login';
export const PROFILE_URL = '/api/v1/me';
export const USER_URL = '/api/v1/user';
export const QUESTION_URL = '/api/v1/question';
export const TAG_URL = '/api/v1/tag';
export const CATEGORY_URL = '/api/v1/category';
export const IMAGE_URL = '/api/v1/image';
export const SERVER_ERROR_URL = '/api/v1/serverError';

const _fetchTimeout = (url, options) => {
  let didTimeOut = false;
  return new Promise(function(resolve, reject) {
    const controller = new AbortController();
    const signal = controller.signal;

    const timeout = setTimeout(function() {
      didTimeOut = true;
      reject('timeout');
      controller.abort();
    }, config.TIMEOUT);

    fetch(url, { ...options, signal })
      .then(function(response) {
        clearTimeout(timeout);
        if (!didTimeOut) {
          resolve(response);
        }
      })
      .catch(function(err) {
        // Rejection already happened with setTimeout
        if (didTimeOut) return;
        // Reject with error
        reject(err);
      });
  });
};

const _http = ({ url, method, headers, data, isFormData }) => {
  // eslint-disable-next-line
  console.info(url, data || '');
  headers = headers || {};
  headers[ 'pragma' ] = 'no-cache';
  headers[ 'cache-control' ] = 'no-cache';

  const options = {
    method,
    headers,
  };
  if (data) {
    if (isFormData) {
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
    }
  }

  return _fetchTimeout(config.API_URL + url, options)
    .then(res => res.json())
    .then(data => {
      // eslint-disable-next-line
      console.info(url, 'response: ', data);
      if (data.error) {
        return Promise.reject(data.error);
      }
      return data;
    })
    .catch(err => {
      if (err instanceof TypeError || err === 'timeout') {
        return Promise.reject('No Connection');
      }
      return Promise.reject(err);
    });
};

export const httpGet = (url, params) => {
  let query = '';
  if (params) {
    query = Object.keys(params).map((key, i) => {
      const value = params[ key ];
      return `${i === 0 ? '?' : '&'}${key}=${value}`;
    }).join('');
  }
  return _http({
    url: url + query,
    method: 'GET',
  });
};

export const httpPost = (url, data) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  return _http({
    url,
    method: 'POST',
    headers,
    data,
  });
};

export const httpDelete = url => {
  return _http({
    url,
    method: 'DELETE',
  });
};

export const httpPostFormData = (url, formData) => {
  const headers = {};
  return _http({
    url,
    method: 'POST',
    headers,
    data: formData,
    isFormData: true,
  });
};

export const httpPut = (url, data) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  return _http({
    url,
    method: 'PUT',
    headers,
    data,
  });
};
