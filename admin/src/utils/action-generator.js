import { camelCase } from 'lodash';

const STATUS_LIST = ['ERROR', 'REQUEST', 'SUCCESS'];
const STATUS_READY = 'STATUS_READY';

export default class ActionGenerator {
  actionNames = {};
  initialStatus = {};
  initialError = {};

  constructor(normalActions, requestActions) {
    normalActions.forEach(key => {
      this.actionNames[ key ] = key;
    });
    requestActions.forEach(key => {
      STATUS_LIST.forEach(status => {
        const actionName = `${key}_${status}`;
        this.actionNames[ actionName ] = actionName;
      });
      this.actionNames[ key ] = key;
      this.initialStatus[ camelCase(key) ] = STATUS_READY;
      this.initialError[ camelCase(key) ] = '';
    });
  }

  getActionNames() {
    return this.actionNames;
  }

  getInitialStatus() {
    return this.initialStatus;
  }

  getInitialError() {
    return this.initialError;
  }
}
