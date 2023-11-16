import { camelCase } from 'lodash';

import {
  initialStatus,
  STATUS_LOADING,
  STATUS_SUCCESS,
  STATUS_ERROR,
} from '../constants';

const requestRegex = /^(.*)_(REQUEST|SUCCESS|ERROR)$/;

export default (state = initialStatus, action) => {
  const { type } = action;
  const matches = requestRegex.exec(type);

  if (!matches) return state;

  const [, requestName, requestState] = matches;
  const requestCamelName = camelCase(requestName);

  let status;
  switch (requestState) {
    case 'REQUEST':
      status = STATUS_LOADING;
      break;
    case 'SUCCESS':
      status = STATUS_SUCCESS;
      break;
    case 'ERROR':
      status = STATUS_ERROR;
      break;
    default:
      status = state[ requestCamelName ];
      break;
  }
  return {
    ...state,
    [ requestCamelName ]: status,
  };
};
