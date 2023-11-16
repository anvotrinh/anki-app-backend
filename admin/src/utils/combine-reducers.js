import { combineReducers } from 'redux';

const requestRegex = /^(.*)_(REQUEST|SUCCESS|ERROR)$/;
function requestStateReducer(requestName, initialState, action) {
  const { type, payload } = action;
  const matches = requestRegex.exec(type);
  if (!matches) return [false];

  const [, typeRequestName, requestState] = matches;
  if (typeRequestName !== requestName) {
    return [false];
  }
  switch (requestState) {
    case 'SUCCESS':
      return [true, payload];
    case 'REQUEST':
      return [false];
    case 'ERROR':
      return [true, initialState];
    default:
      return [false];
  }
}

function requestReducer(param) {
  if (typeof param === 'function') {
    return param;
  }
  const { requestName, initialState, next } = param;
  return (state = initialState, action) => {
    const [isMatch, reqState] = requestStateReducer(requestName, initialState, action);
    if (isMatch) {
      return reqState;
    }
    if (typeof next === 'function') {
      return next(state, action);
    }
    return state;
  };
}

export default reducers => {
  for (let i in reducers) {
    reducers[ i ] = requestReducer(reducers[ i ]);
  }
  return combineReducers(reducers);
};
