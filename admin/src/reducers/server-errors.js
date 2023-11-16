import AC from '../constants';

const initialState = [];

function next(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case AC.REMOVE_SERVER_ERROR_FROM_LIST:
      return state.filter(e => payload.indexOf(e.id) === -1);
    case AC.EDIT_SERVER_ERROR_IN_LIST:
      var index = state.findIndex(e => e.id === payload.id);
      return [
        ...state.slice(0, index),
        payload,
        ...state.slice(index + 1),
      ];
    default:
      return state;
  }
}

export default {
  requestName: AC.LIST_SERVER_ERROR,
  initialState,
  next,
};
