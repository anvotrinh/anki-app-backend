import AC from '../constants';
import { LOGIN_URL, httpPost } from '../services/http-requests';
import { setCookie } from '../utils/cookie';

export function login(email, password) {
  return dispatch => {
    dispatch({ type: AC.LOGIN_REQUEST });
    return httpPost(LOGIN_URL, { email, password })
      .then(() => dispatch({ type: AC.LOGIN_SUCCESS }))
      .catch(err => dispatch({ type: AC.LOGIN_ERROR, payload: err }));
  };
}

export function logout() {
  setCookie('has_token', 'false', 365);
  return { type: AC.LOGOUT };
}
