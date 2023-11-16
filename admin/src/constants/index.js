import ActionGenerator from '../utils/action-generator';
import { NormalActions, RequestActions } from './actions';

const actionGenerator = new ActionGenerator(NormalActions, RequestActions);
export const initialStatus = actionGenerator.getInitialStatus();
export const initialError = actionGenerator.getInitialError();
export default actionGenerator.getActionNames();

export const STATUS_READY = 'STATUS_READY';
export const STATUS_LOADING = 'STATUS_LOADING';
export const STATUS_SUCCESS = 'STATUS_SUCCESS';
export const STATUS_ERROR = 'STATUS_ERROR';

export const APP_CONST = {
  TYPE_IMAGE_ANSWER: 'image_answer',
  TYPE_TEXT_ANSWER: 'text_answer',
};

export const COMMON_LANG = {
  TITLE: 'AntRe　Admin',
  LOGOUT: 'ログアウト',
};

export const IMPORT_QUESTION_LANG = {
  TITLE: '問題のインポート',
  QUESTION_IMAGE: '問題（画像）',
  QUESTION_TEXT: '問題（テキスト）',
  DEFAULT_QUESTION_INPUT: 'これは何ですか？',
  QUESTION_TEXT_PLACEHOLDER: '問題文入力',
  ANSWER_IMAGE: '解答（画像）',
  ANSWER_TEXT: '解答（テキスト）',
  ANSWER_TEXT_PLACEHOLDER: '解答入力',
  CATEGORY: 'カテゴリ',
  DIFFICULTY: '難易度',
  START: 'スタート',
  NO_QUESTION_WARNING: '作成する質問はありません',
  NOT_ENOUGH_INPUT_WARNING: '質問または回答が空です',
  STATUS: 'ステータス',
};

export const IMPORT_USER_LANG = {
  TITLE: 'ユーザーのインポート',
  INVALID_EMAIL: 'メールが空白',
  INVALID_NAME: 'お名前を入力してください。',
  INVALID_PASSWORD: 'パスワードは最低１大文字と最低１小文字を含む8文字以上が必要です。',
  INVALID_BIRTHDAY: '誕生日が無効です',
  NO_USER_WARNING: '作成するユーザーはいません',
  START: 'スタート',
  EMAIL_ADDRESS: 'メールアドレス',
  NAME: '名前',
  BIRTHDAY: '生年月日',
  PASSWORD: 'パスワード',
  STATUS: 'ステータス',
};

export const QUESTION_CSV_LANG = {
  TITLE: 'Question CSV',
  LINE_NUMBER: 'Line number',
  ITEM_NAME: 'Item name',
  ITEM_VALUE: 'Item value',
  EXPORT_CSV: 'Export CSV',
  MESSAGE: 'Message',
  ITEM_NAMES: {
    category: 'カテゴリ',
    tag: 'Tag',
    questionText: '問題（テキスト）',
    answerText: '解答（テキスト）',
    difficulty: '難易度',
  },
  ERROR_MESSAGES: {
    limit_bytes: '{1} is too long, maximum is 4096 bytes',
    required: '{1} is required',
    number: '{1} is not a number',
    difficulty_value: '{1} must be >= 0 and <= 10',
  },
};

export const LOGIN_LANG = {
  LOGIN: 'ログイン',
  EMAIL_ADDRESS_PLACEHOLDER: 'メール',
  PASSWORD_PLACEHOLDER: 'パスワード',
};

export const SERVER_ERROR_LANG = {
  TITLE: 'Server Errors',
  ERROR_TITLE: 'Title',
  DATE: 'Date',
  COUNT: 'Count',
  USER_IDS: 'User Ids',
  DETAIL: 'Detail',
  NO_ERROR: 'No Error',
  RELOAD: 'Reload',
  RESOLVE: 'Resolve',
  UNRESOLVE: 'Unresolve',
  REMOVE: 'Remove',
  SHOW_MORE: 'Show More...',
  SHOW_LESS: 'Show Less',
};
