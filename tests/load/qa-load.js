import http from 'k6/http';
import { check, sleep } from 'k6';

const QA = __ENV.QA_BASE_URL;
const ORIGIN = __ENV.QA_ORIGIN;
const PROFILE = __ENV.PROFILE || 'staged';
if (QA !== 'https://hnuinlqbbgejsvdiyihi.supabase.co' || QA.includes('ybccbyyrrxdzarsgylql')) throw new Error('QA-only safety guard failed');

const staged = [
  { duration: '1m', target: 50 }, { duration: '2m', target: 50 },
  { duration: '1m', target: 100 }, { duration: '2m', target: 100 },
  { duration: '1m', target: 250 }, { duration: '3m', target: 250 },
  { duration: '2m', target: 500 }, { duration: '3m', target: 500 },
  { duration: '2m', target: 1000 }, { duration: '3m', target: 1000 },
  { duration: '3m', target: 0 },
];
const spike = [{duration:'1m',target:100},{duration:'30s',target:1000},{duration:'2m',target:1000},{duration:'2m',target:100},{duration:'2m',target:0}];
const stress = [{duration:'2m',target:100},{duration:'2m',target:250},{duration:'2m',target:500},{duration:'2m',target:750},{duration:'2m',target:1000},{duration:'3m',target:1000},{duration:'3m',target:0}];

export const options = {
  stages: PROFILE === 'spike' ? spike : PROFILE === 'stress' ? stress : staged,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<5000'],
  },
  gracefulStop: '30s',
};

const headers = { 'Content-Type':'application/json', 'Origin': ORIGIN };
export default function () {
  // Read-only/public operation: no SMS, no Production, no destructive mutations.
  const r = http.post(`${QA}/functions/v1/user-rpc`, JSON.stringify({ rpc:'public_site_config', args:{} }), { headers, timeout:'15s' });
  check(r, { 'non-5xx': x => x.status < 500, 'response under 5s': x => x.timings.duration < 5000 });
  sleep(0.5 + Math.random());
}
