import { uniq } from 'lodash';

import AC from '../constants';
import { APP_CONST, IMPORT_QUESTION_LANG } from '../constants';
import { QUESTION_URL, httpPost, httpGet } from '../services/http-requests';
import { uploadImage } from './image';

export function uploadQuestion ({ questionImg, questionText, answerImg, answerText, difficulty, categoryId1, categoryId2, categoryId3 }) {
  return dispatch => {
    dispatch({ type: AC.UPLOAD_QUESTION_REQUEST });
    return Promise.all([uploadImage(questionImg), uploadImage(answerImg)])
      .then(result => {
        const data = {
          question_raw_image_url: result[ 0 ].link,
          question_image_url: result[ 0 ].link,
          answer: result[ 1 ].link || answerText || ' ',
          type: answerImg ? APP_CONST.TYPE_IMAGE_ANSWER : APP_CONST.TYPE_TEXT_ANSWER,
          difficulty: difficulty,
          question_text: questionText || IMPORT_QUESTION_LANG.DEFAULT_QUESTION_INPUT,
          category_ids: uniq([categoryId1, categoryId2, categoryId3]).filter(e => e !== '').join(','),
        };
        return httpPost(QUESTION_URL, data);
      })
      .then(() => dispatch({ type: AC.UPLOAD_QUESTION_SUCCESS }))
      .catch(err => dispatch({ type: AC.UPLOAD_QUESTION_ERROR, payload: err }));
  };
}

export function listQuestion() {
  return dispatch => {
    dispatch({ type: AC.LIST_QUESTION_REQUEST });

    return httpGet(QUESTION_URL)
      .then(list =>
        dispatch({ type: AC.LIST_QUESTION_SUCCESS, payload: list.reverse() })
      )
      .catch(err => dispatch({ type: AC.LIST_QUESTION_ERROR, payload: err }));
  };
}