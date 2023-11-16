import AC from '../constants';
import { CATEGORY_URL, httpGet, httpPost } from '../services/http-requests';

export function listCategory() {
  return dispatch => {
    dispatch({ type: AC.LIST_CATEGORY_REQUEST });

    return httpGet(CATEGORY_URL)
      .then(list =>
        dispatch({ type: AC.LIST_CATEGORY_SUCCESS, payload: list.reverse() })
      )
      .catch(err => dispatch({ type: AC.LIST_CATEGORY_ERROR, payload: err }));
  };
}

export function uploadCategory(data) {
  return dispatch => {
    dispatch({ type: AC.UPLOAD_CATEGORY_REQUEST });
    return httpPost(CATEGORY_URL, data)
      .then(() => dispatch({ type: AC.UPLOAD_CATEGORY_SUCCESS }))
      .catch(err => dispatch({ type: AC.UPLOAD_CATEGORY_ERROR, payload: err }));
  };
}