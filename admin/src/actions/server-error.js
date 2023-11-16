import AC from '../constants';
import { SERVER_ERROR_URL, httpGet, httpPut, httpDelete } from '../services/http-requests';

export function listServerError() {
  return dispatch => {
    dispatch({ type: AC.LIST_SERVER_ERROR_REQUEST });

    return httpGet(SERVER_ERROR_URL)
      .then(list =>
        dispatch({ type: AC.LIST_SERVER_ERROR_SUCCESS, payload: list.reverse() })
      )
      .catch(err => dispatch({ type: AC.LIST_SERVER_ERROR_ERROR, payload: err }));
  };
}

export function editServerError(input) {
  return dispatch => {
    dispatch({ type: AC.EDIT_SERVER_ERROR_REQUEST });
    return httpPut(SERVER_ERROR_URL + '/' + input.id, input)
      .then(serverError => {
        dispatch({ type: AC.EDIT_SERVER_ERROR_IN_LIST, payload: serverError });
        dispatch({ type: AC.EDIT_SERVER_ERROR_SUCCESS });
      })
      .catch(err => dispatch({ type: AC.EDIT_SERVER_ERROR_ERROR, payload: err }));
  };
}

export function removeServerError(serverErrorId) {
  return dispatch => {
    dispatch({ type: AC.REMOVE_SERVER_ERROR_REQUEST });
    return httpDelete(SERVER_ERROR_URL + '/' + serverErrorId)
      .then(() => {
        dispatch({ type: AC.REMOVE_SERVER_ERROR_FROM_LIST, payload: serverErrorId });
        dispatch({ type: AC.REMOVE_SERVER_ERROR_SUCCESS });
      })
      .catch(err => dispatch({ type: AC.REMOVE_SERVER_ERROR_ERROR, payload: err }));
  };
}
