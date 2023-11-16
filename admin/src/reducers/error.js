import { camelCase } from 'lodash';

import { initialError } from '../constants';

const requestRegex = /^(.*)_(REQUEST|SUCCESS|ERROR)$/;

export default (state = initialError, action) => {
  const { type, payload } = action;
  const matches = requestRegex.exec(type);

  if (!matches) return state;

  const [, requestName, requestState] = matches;
  const requestCamelName = camelCase(requestName);

  let err = '';
  if (requestState === 'ERROR') {
    err = payload;
  }

  return {
    ...state,
    [ requestCamelName ]: err,
  };
};
