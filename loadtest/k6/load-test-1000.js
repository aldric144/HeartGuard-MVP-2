import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { API_BASE_URL, thresholds, generateTestUser, sampleChatMessages, sampleMetadata } from './config.js';
import { tagRequest, checkResponse, randomSleep, randomItem, randomString } from './utils.js';

export const options = {
  scenarios: {
    load_1000: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 1000,
      maxVUs: 2000,
      stages: [
        { target: 100, duration: '1m' },   // Ramp up to 100 RPS
        { target: 500, duration: '2m' },   // Ramp up to 500 RPS
        { target: 1000, duration: '2m' },  // Ramp up to 1000 RPS
        { target: 1000, duration: '30m' }, // Stay at 1000 RPS
        { target: 500, duration: '2m' },   // Ramp down to 500 RPS
        { target: 0, duration: '1m' },     // Ramp down to 0
      ],
    },
  },
  thresholds: thresholds,
};

const testPhoto = open('/fixtures/test-photo.jpg', 'b');

export default function () {
  const user = generateTestUser(__VU);
  const scenario = Math.random();
  
  if (scenario < 0.1) {
    const response = http.get(`${API_BASE_URL}/health`, tagRequest('health'));
    checkResponse(response, 'health', 200);
    randomSleep(0.1, 0.5);
    return;
  }
  
  if (scenario < 0.25) {
    let response = http.post(
      `${API_BASE_URL}/auth/register`,
      JSON.stringify({
        email: `${randomString(10)}@heartguard.test`,
        password: 'LoadTest2024!',
        name: `Test User ${randomString(5)}`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        ...tagRequest('register'),
      }
    );
    checkResponse(response, 'register', 200);
    
    randomSleep(0.5, 1);
    
    response = http.post(
      `${API_BASE_URL}/auth/login`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        ...tagRequest('login'),
      }
    );
    checkResponse(response, 'login', 200);
    
    randomSleep(0.5, 1);
    return;
  }
  
  if (scenario < 0.55) {
    const numMessages = Math.floor(Math.random() * 5) + 3;
    const messages = [];
    for (let i = 0; i < numMessages; i++) {
      messages.push(randomItem(sampleChatMessages));
    }
    
    const response = http.post(
      `${API_BASE_URL}/analyze/chat`,
      JSON.stringify({ messages: messages }),
      {
        headers: { 'Content-Type': 'application/json' },
        ...tagRequest('analyze_chat'),
      }
    );
    checkResponse(response, 'analyze_chat', 200);
    
    randomSleep(0.5, 1.5);
    return;
  }
  
  if (scenario < 0.75) {
    const boundary = '----WebKitFormBoundary' + randomString(16);
    const body = `------${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.jpg"\r\nContent-Type: image/jpeg\r\n\r\n${testPhoto}\r\n------${boundary}--\r\n`;
    
    const response = http.post(
      `${API_BASE_URL}/analyze/photo`,
      body,
      {
        headers: { 'Content-Type': `multipart/form-data; boundary=----${boundary}` },
        ...tagRequest('analyze_photo'),
      }
    );
    checkResponse(response, 'analyze_photo', 200);
    
    randomSleep(1, 2);
    return;
  }
  
  if (scenario < 0.90) {
    const response = http.post(
      `${API_BASE_URL}/analyze/metadata`,
      JSON.stringify({
        profile_id: `profile_${randomString(10)}`,
        phone_number: `+1-555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        location: randomItem(['Lagos, Nigeria', 'Accra, Ghana', 'Manila, Philippines', 'Dhaka, Bangladesh']),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        ...tagRequest('analyze_metadata'),
      }
    );
    checkResponse(response, 'analyze_metadata', 200);
    
    randomSleep(0.5, 1);
    return;
  }
  
  const response = http.post(
    `${API_BASE_URL}/trust/generate`,
    JSON.stringify({
      person_name: `Person ${randomString(5)}`,
      messages: sampleChatMessages.slice(0, 5),
      profile_id: `profile_${randomString(10)}`,
      phone_number: `+1-555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      ...tagRequest('generate_trust_score'),
    }
  );
  checkResponse(response, 'generate_trust_score', 200);
  
  randomSleep(1, 2);
}

export function handleSummary(data) {
  return {
    '/results/load-test-1000-summary.json': JSON.stringify(data, null, 2),
    '/results/load-test-1000-summary.txt': textSummary(data, { indent: ' ', enableColors: false }),
  };
}
