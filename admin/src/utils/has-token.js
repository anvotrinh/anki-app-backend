import { getCookie } from './cookie';

export default () => {
  return getCookie('has_token') === 'true';
};
