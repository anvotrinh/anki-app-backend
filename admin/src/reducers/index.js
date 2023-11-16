import combineReducers from '../utils/combine-reducers';

import categories from './categories';
import error from './error';
import profile from './profile';
import status from './status';
import questions from './questions';
import tags from './tags';
import serverErrors from './server-errors';

const rootReducer = {
  categories,
  error,
  profile,
  status,
  questions,
  tags,
  serverErrors,
};

export default combineReducers(rootReducer);
