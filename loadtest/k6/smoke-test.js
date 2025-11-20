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
  const user = generateTestUser(__VU);
  
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
  checkResponse(response, 'register', 200);
  
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
  
  response = http.post(
    `${API_BASE_URL}/analyze/metadata`,
    JSON.stringify(sampleMetadata),
    {
      headers: { 'Content-Type': 'application/json' },
      ...tagRequest('analyze_metadata'),
    }
  );
  checkResponse(response, 'analyze_metadata', 200);
  
  randomSleep(1, 2);
  
  response = http.get(`${API_BASE_URL}/subscription/tiers`, tagRequest('subscription_tiers'));
  checkResponse(response, 'subscription_tiers', 200);
  
  randomSleep(1, 2);
  
  if (sessionToken) {
    response = http.get(
      `${API_BASE_URL}/usage/status`,
      {
        headers: { 'Authorization': `Bearer ${sessionToken}` },
        ...tagRequest('usage_status'),
      }
    );
    checkResponse(response, 'usage_status', 200);
  }
  
  randomSleep(1, 2);
  
  response = http.get(
    `${API_BASE_URL}/safety/replies?risk_level=high`,
    tagRequest('safety_replies')
  );
  checkResponse(response, 'safety_replies', 200);
  
  randomSleep(1, 2);
  
  response = http.get(`${API_BASE_URL}/community/stats`, tagRequest('community_stats'));
  checkResponse(response, 'community_stats', 200);
  
  randomSleep(2, 3);
}
