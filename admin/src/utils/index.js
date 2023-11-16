import React from 'react';

import { STATUS_LOADING, STATUS_SUCCESS, STATUS_ERROR } from '../constants';

export function isStatusLoading(status) {
  return status === STATUS_LOADING;
}

export function isStatusSuccess(status, nextStatus) {
  if (!nextStatus) {
    return status === STATUS_SUCCESS;
  }
  return status === STATUS_LOADING && nextStatus === STATUS_SUCCESS;
}

export function isStatusError(status, nextStatus) {
  if (!nextStatus) {
    return status === STATUS_ERROR;
  }
  return status === STATUS_LOADING && nextStatus === STATUS_ERROR;
}

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export function isValidEmail(email) {
  return emailRegex.test(email);
}

export function isValidName(name) {
  return !!name;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
export function isValidPassword(password) {
  return passwordRegex.test(password);
}

export function isValidDate(date) {
  return date && !isNaN(new Date(date));
}

export function toMultipleLine(param) {
  let arr;
  if (Array.isArray(param)) {
    arr = param;
  } else {
    arr = param.split('\n');
  }
  return arr.map((line, index) => (
    <span key={index}>
      {line}<br/>
    </span>
  ));
}