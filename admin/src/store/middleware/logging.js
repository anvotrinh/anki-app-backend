const loggingMiddleware = store => next => action => {
  // eslint-disable-next-line
  console.info(`INFO: Dispatching a ${action.type} with payload: ${action.payload}`);
  const result = next(action);
  // eslint-disable-next-line
  console.info('Next State:', store.getState());
  return result;
};

export default loggingMiddleware;
