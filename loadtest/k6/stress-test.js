import http from 'k6/http';
import { check, sleep } from 'k6';
import { API_BASE_URL, thresholds, generateTestUser, sampleChatMessages } from './config.js';
import { tagRequest, checkResponse, randomSleep, randomItem, randomString } from './utils.js';

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { target: 100, duration: '2m' },
        { target: 200, duration: '2m' },
        { target: 500, duration: '2m' },
        { target: 1000, duration: '2m' },
        { target: 2000, duration: '2m' },
        { target: 3000, duration: '2m' },
        { target: 5000, duration: '2m' },
        { target: 5000, duration: '5m' }, // Hold at peak
        { target: 0, duration: '3m' },
      ],
    },
  },
  thresholds: {
    'http_req_failed': ['rate<0.05'], // Allow 5% failure rate for stress test
    'http_req_duration': ['p(95)<5000'], // Allow up to 5s response time
  },
};

export default function () {
  const user = generateTestUser(__VU);
  
  const scenario = Math.random();
  
  if (scenario < 0.3) {
    const response = http.post(
      `${API_BASE_URL}/analyze/chat`,
      JSON.stringify({ messages: sampleChatMessages.slice(0, 5) }),
      {
        headers: { 'Content-Type': 'application/json' },
        ...tagRequest('analyze_chat'),
      }
    );
    check(response, {
      'chat analysis completed': (r) => r.status === 200 || r.status === 429 || r.status === 503,
    });
  } else if (scenario < 0.6) {
    const response = http.post(
      `${API_BASE_URL}/analyze/metadata`,
      JSON.stringify({
        profile_id: `profile_${randomString(10)}`,
        phone_number: `+1-555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        ...tagRequest('analyze_metadata'),
      }
    );
    check(response, {
      'metadata analysis completed': (r) => r.status === 200 || r.status === 429 || r.status === 503,
    });
  } else if (scenario < 0.8) {
    const response = http.get(`${API_BASE_URL}/health`, tagRequest('health'));
    check(response, {
      'health check passed': (r) => r.status === 200 || r.status === 503,
    });
  } else {
    const response = http.get(`${API_BASE_URL}/subscription/tiers`, tagRequest('subscription_tiers'));
    check(response, {
      'subscription tiers retrieved': (r) => r.status === 200 || r.status === 503,
    });
  }
  
  randomSleep(0.1, 0.5);
}

export function handleSummary(data) {
  return {
    '/results/stress-test-summary.json': JSON.stringify(data, null, 2),
    '/results/stress-test-summary.txt': textSummary(data, { indent: ' ', enableColors: false }),
  };
}
