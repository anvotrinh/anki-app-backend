import { httpGet, httpPost, QUESTION_URL, CATEGORY_URL, TAG_URL } from '../services/http-requests';

const requestFuncs = {
  listQuestion: () => httpGet(QUESTION_URL),
  listCategory: () => httpGet(CATEGORY_URL),
  listTag: () => httpGet(TAG_URL),
  uploadQuestion: data => httpPost(QUESTION_URL, data),
  uploadCategory: data => httpPost(CATEGORY_URL, data),
  uploadTag: data => httpPost(TAG_URL, data),
};

const wait = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
};

class Request {
  updateFunc = null

  constructor() {
    for (const key in requestFuncs) {
      this[ key ] = this.enhance(requestFuncs[ key ]);
    }
  }

  enhance = (requestFunc, number = 1) => {
    return async data => {
      try {
        return await requestFunc(data);
      } catch (e) {
        if (e !== 'No Connection') {
          throw e;
        }
        if (number >= 10) {
          throw 'Can not continue import: No Connection';
        }
        this.updateInfo('No connection. Wait a bit...');
        await wait(2000);
        this.updateInfo(`Retry (${number} times)...`);
        await wait(5000);
        return await this.enhance(requestFunc, number + 1)(data);
      }
    };
  }

  updateInfo = info => {
    if (this.updateFunc && info) {
      this.updateFunc(info);
    }
  }

  setUpdateFunc = func => {
    this.updateFunc = func;
  }
}

export default new Request();