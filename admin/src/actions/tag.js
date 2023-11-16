import AC from '../constants';
import { TAG_URL, httpGet, httpPost } from '../services/http-requests';

export function listTag() {
  return dispatch => {
    dispatch({ type: AC.LIST_TAG_REQUEST });

    return httpGet(TAG_URL)
      .then(list =>
        dispatch({ type: AC.LIST_TAG_SUCCESS, payload: list.reverse() })
      )
      .catch(err => dispatch({ type: AC.LIST_TAG_ERROR, payload: err }));
  };
}

export function uploadTag(data) {
  return dispatch => {
    dispatch({ type: AC.UPLOAD_TAG_REQUEST });
    return httpPost(TAG_URL, data)
      .then(() => dispatch({ type: AC.UPLOAD_TAG_SUCCESS }))
      .catch(err => dispatch({ type: AC.UPLOAD_TAG_ERROR, payload: err }));
  };
}