import { check, sleep } from 'k6';
import http from 'k6/http';

export function tagRequest(endpoint) {
  return { tags: { endpoint: endpoint } };
}

export function checkResponse(response, endpoint, expectedStatus = 200) {
  const checks = {
    [`${endpoint}: status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${endpoint}: response time < 5s`]: (r) => r.timings.duration < 5000,
  };
  
  return check(response, checks);
}

export function createMultipartFormData(file, boundary) {
  const body = [];
  
  body.push(`--${boundary}\r\n`);
  body.push(`Content-Disposition: form-data; name="file"; filename="${file.name}"\r\n`);
  body.push(`Content-Type: ${file.type}\r\n\r\n`);
  body.push(file.data);
  body.push(`\r\n--${boundary}--\r\n`);
  
  return body.join('');
}

export function randomSleep(min = 1, max = 3) {
  sleep(Math.random() * (max - min) + min);
}

export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomString(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
