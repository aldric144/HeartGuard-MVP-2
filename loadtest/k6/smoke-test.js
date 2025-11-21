import http from 'k6/http';
import { check, sleep } from 'k6';
import { API_BASE_URL, thresholds, generateTestUser, sampleChatMessages, sampleMetadata } from './config.js';
import { tagRequest, checkResponse, randomSleep, randomItem } from './utils.js';

export const options = {
  vus: 10,
  duration: '5m',
  thresholds: thresholds,
};

export default function () {
  const user = generateTestUser(__VU, __ITER);
  
  let response = http.get(`${API_BASE_URL}/health`, tagRequest('health'));
  checkResponse(response, 'health', 200);
  
  randomSleep(0.5, 1);
  
  response = http.post(
    `${API_BASE_URL}/auth/register`,
    `email=${encodeURIComponent(user.email)}&password=${encodeURIComponent(user.password)}`,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      ...tagRequest('register'),
    }
  );
  
  if (response.status !== 200 && response.status !== 400) {
    checkResponse(response, 'register', 200);
  }
  
  randomSleep(1, 2);
  
  response = http.post(
    `${API_BASE_URL}/auth/login`,
    `email=${encodeURIComponent(user.email)}&password=${encodeURIComponent(user.password)}`,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      ...tagRequest('login'),
    }
  );
  checkResponse(response, 'login', 200);
  
  let sessionToken = null;
  if (response.status === 200) {
    try {
      const body = JSON.parse(response.body);
      sessionToken = body.session_token || body.token;
    } catch (e) {
      console.error('Failed to parse login response');
    }
  }
  
  randomSleep(1, 2);
  
  response = http.post(
    `${API_BASE_URL}/analyze/chat`,
    JSON.stringify({
      messages: sampleChatMessages.slice(0, 5),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      ...tagRequest('analyze_chat'),
    }
  );
  checkResponse(response, 'analyze_chat', 200);
  
  randomSleep(1, 2);
  
  const profileId = encodeURIComponent(sampleMetadata.profile_id || 'test_profile');
  const phoneNumber = encodeURIComponent(sampleMetadata.phone_number || '+234-123-4567');
  const location = encodeURIComponent(sampleMetadata.location || 'Lagos, Nigeria');
  
  response = http.post(
    `${API_BASE_URL}/analyze/metadata`,
    `profile_id=${profileId}&phone_number=${phoneNumber}&location=${location}`,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      ...tagRequest('analyze_metadata'),
    }
  );
  checkResponse(response, 'analyze_metadata', 200);
  
  randomSleep(1, 2);
  
  randomSleep(1, 2);
  
  response = http.get(`${API_BASE_URL}/community/stats`, tagRequest('community_stats'));
  checkResponse(response, 'community_stats', 200);
  
  randomSleep(2, 3);
}
