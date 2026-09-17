import http from 'k6/http';
import { check, sleep } from 'k6';

const QA = __ENV.QA_BASE_URL;
const ORIGIN = __ENV.QA_ORIGIN;
if (QA !== 'https://hnuinlqbbgejsvdiyihi.supabase.co' || QA.includes('ybccbyyrrxdzarsgylql')) throw new Error('QA-only safety guard failed');

export const options = {
  stages: [
    { duration:'1m', target:100 }, { duration:'2m', target:100 },
    { duration:'1m', target:250 }, { duration:'2m', target:250 },
    { duration:'1m', target:500 }, { duration:'3m', target:500 },
    { duration:'1m', target:1000 }, { duration:'3m', target:1000 },
    { duration:'2m', target:2000 }, { duration:'4m', target:2000 },
    // spike and recovery
    { duration:'20s', target:500 }, { duration:'20s', target:2000 },
    { duration:'2m', target:2000 }, { duration:'2m', target:250 },
    // sustained stress and final recovery
    { duration:'1m', target:1000 }, { duration:'1m', target:1500 },
    { duration:'1m', target:2000 }, { duration:'4m', target:2000 },
    { duration:'3m', target:100 }, { duration:'2m', target:100 },
    { duration:'2m', target:0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<5000'],
    checks: ['rate>0.99'],
  },
  gracefulStop:'30s',
};

const headers = { 'Content-Type':'application/json', 'Origin':ORIGIN };
const publicCalls = [
  ['public_site_config', {}],
  ['is_volunteer_scoring_enabled', {}],
];

function rpc(name,args={}) {
  const r=http.post(`${QA}/functions/v1/user-rpc`,JSON.stringify({name,args}),{headers,timeout:'15s',tags:{rpc:name}});
  let body=null; try { body=r.json(); } catch(_) {}
  check(r,{
    'HTTP 200':x=>x.status===200,
    'valid RPC payload':()=>body!==null&&Object.prototype.hasOwnProperty.call(body,'data'),
    'response under 5s':x=>x.timings.duration<5000,
  },{rpc:name});
}

export default function(){
  const [name,args]=publicCalls[Math.floor(Math.random()*publicCalls.length)];
  rpc(name,args);
  sleep(0.5+Math.random()*1.5);
}
