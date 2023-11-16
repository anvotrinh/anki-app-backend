import AC from '../constants';
import { USER_URL, httpPost } from '../services/http-requests';

export function uploadUser(input) {
  return dispatch => {
    dispatch({ type: AC.UPLOAD_USER_REQUEST });
    return httpPost(USER_URL, input)
      .then(() => dispatch({ type: AC.UPLOAD_USER_SUCCESS }))
      .catch(err => dispatch({ type: AC.UPLOAD_USER_ERROR, payload: err }));
  };
}
