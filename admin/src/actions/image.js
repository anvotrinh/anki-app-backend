import { IMAGE_URL, httpPostFormData } from '../services/http-requests';

export function uploadImage(file) {
  if (!file) {
    return Promise.resolve({ link: '' });
  }
  const formData = new FormData();
  formData.append('image', file);
  return httpPostFormData(IMAGE_URL, formData);
}
