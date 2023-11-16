import AC from '../constants';
import { PROFILE_URL, httpGet } from '../services/http-requests';

export function getProfile() {
  return dispatch => {
    dispatch({ type: AC.GET_PROFILE_REQUEST });

    return httpGet(PROFILE_URL)
      .then(info => dispatch({ type: AC.GET_PROFILE_SUCCESS, payload: info }))
      .catch(err => dispatch({ type: AC.GET_PROFILE_ERROR, payload: err }));
  };
}
