import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from '../reducers';
import loggingMiddleware from './middleware/logging';

const configureStore = initialState => {
  const middleware = applyMiddleware(thunk, loggingMiddleware);

  return createStore(rootReducer, initialState, middleware);
};

export default configureStore;
