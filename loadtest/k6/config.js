export const API_BASE_URL = __ENV.API_BASE_URL || 'http://api:8000';

export const thresholds = {
  'http_req_failed': ['rate<0.01'],
  
  'http_req_duration{endpoint:health}': ['p(95)<200'],
  'http_req_duration{endpoint:analyze_photo}': ['p(95)<2500'],
  'http_req_duration{endpoint:analyze_chat}': ['p(95)<1500'],
  'http_req_duration{endpoint:analyze_metadata}': ['p(95)<1000'],
  'http_req_duration{endpoint:generate_trust_score}': ['p(95)<2500'],
  'http_req_duration{endpoint:get_trust_report}': ['p(95)<1000'],
  'http_req_duration{endpoint:generate_evidence_report}': ['p(95)<4000'],
  'http_req_duration{endpoint:list_reports}': ['p(95)<1000'],
  'http_req_duration{endpoint:get_timeline}': ['p(95)<1000'],
  'http_req_duration{endpoint:get_pattern_analytics}': ['p(95)<1500'],
  
  'checks': ['rate>0.99'],
};

export const scenarios = {
  smoke: {
    executor: 'constant-vus',
    vus: 10,
    duration: '5m',
  },
  
  load_50: {
    executor: 'ramping-arrival-rate',
    startRate: 0,
    timeUnit: '1s',
    preAllocatedVUs: 50,
    maxVUs: 100,
    stages: [
      { target: 50, duration: '2m' },  // Ramp up to 50 RPS
      { target: 50, duration: '15m' }, // Stay at 50 RPS
      { target: 0, duration: '1m' },   // Ramp down
    ],
  },
  
  load_200: {
    executor: 'ramping-arrival-rate',
    startRate: 0,
    timeUnit: '1s',
    preAllocatedVUs: 200,
    maxVUs: 400,
    stages: [
      { target: 200, duration: '3m' },  // Ramp up to 200 RPS
      { target: 200, duration: '20m' }, // Stay at 200 RPS
      { target: 0, duration: '2m' },    // Ramp down
    ],
  },
  
  load_1000: {
    executor: 'ramping-arrival-rate',
    startRate: 0,
    timeUnit: '1s',
    preAllocatedVUs: 1000,
    maxVUs: 2000,
    stages: [
      { target: 1000, duration: '5m' },  // Ramp up to 1000 RPS
      { target: 1000, duration: '30m' }, // Stay at 1000 RPS
      { target: 0, duration: '3m' },     // Ramp down
    ],
  },
  
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
      { target: 0, duration: '2m' },
    ],
  },
};

export function generateTestUser(vuId) {
  return {
    email: `loadtest_user_${vuId}@heartguard.test`,
    password: 'LoadTest2024!',
    name: `Test User ${vuId}`,
  };
}

export const sampleChatMessages = [
  "Hi, how are you doing today?",
  "I've been thinking about you a lot lately.",
  "You're so special to me, I feel like we have a real connection.",
  "I'm in a bit of trouble and could really use your help.",
  "Can you send me some money? I promise I'll pay you back soon.",
  "Please don't tell anyone about this, it's just between us.",
  "If you really cared about me, you would help me out.",
  "I need $500 urgently for an emergency.",
];

export const sampleMetadata = {
  profile_id: 'test_profile_12345',
  phone_number: '+1-555-0123',
  location: 'Lagos, Nigeria',
};
