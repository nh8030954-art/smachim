import http from 'k6/http';
import { check, sleep } from 'k6';

const QA=__ENV.QA_BASE_URL, ORIGIN=__ENV.QA_ORIGIN;
if(QA!=='https://hnuinlqbbgejsvdiyihi.supabase.co'||QA.includes('ybccbyyrrxdzarsgylql')) throw new Error('QA-only safety guard failed');
export const options={stages:[
 {duration:'1m',target:50},{duration:'1m',target:50},
 {duration:'1m',target:100},{duration:'1m',target:100},
 {duration:'1m',target:250},{duration:'2m',target:250},
 {duration:'1m',target:500},{duration:'2m',target:500},
 {duration:'1m',target:1000},{duration:'2m',target:1000},
 {duration:'1m',target:1500},{duration:'2m',target:1500},
 {duration:'1m',target:2000},{duration:'3m',target:2000},
 {duration:'2m',target:100},{duration:'1m',target:0}],
 thresholds:{
  http_req_failed:[{threshold:'rate<0.03',abortOnFail:true,delayAbortEval:'45s'}],
  http_req_duration:[{threshold:'p(95)<5000',abortOnFail:true,delayAbortEval:'90s'}],
  checks:['rate>0.97']
 },gracefulStop:'30s'};
const baseHeaders={'Content-Type':'application/json','Origin':ORIGIN,'apikey':'sb_publishable_khcBO9J5wrLBc8LtkyP5vA_M2vCOHCY'};
let token='',sessionAttempts=0,sessionExhausted=false;
function issueSession(){
 if(sessionExhausted)return;
 sessionAttempts++;
 const r=http.post(`${QA}/functions/v1/qa-load-session`,JSON.stringify({slot:__VU}),{headers:baseHeaders,timeout:'10s',tags:{rpc:'qa_session'}});
 let b=null;try{b=r.json()}catch(_){}
 check(r,{'session issued':x=>x.status===200,'session token valid':()=>typeof b?.token==='string'&&b.token.length>=32});
 if(r.status===200&&b?.token){token=b.token;return;}
 if(sessionAttempts>=2)sessionExhausted=true; else sleep(1);
}
function rpc(name,args={},session=true){
 const h=session?{...baseHeaders,'x-app-session':token}:baseHeaders;
 const r=http.post(`${QA}/functions/v1/user-rpc`,JSON.stringify({name,args}),{headers:h,timeout:'10s',tags:{rpc:name}});
 let b=null;try{b=r.json()}catch(_){}
 check(r,{'HTTP 200':x=>x.status===200,'valid RPC payload':()=>b!==null&&Object.prototype.hasOwnProperty.call(b,'data'),'response under 5s':x=>x.timings.duration<5000},{rpc:name});
 return b?.data;
}
const reads=['username_my_profile','get_dashboard_stats','get_matching_events_v2','get_my_registrations_v2','get_my_notifications','get_my_volunteer_score','get_family_children','get_host_events_v3'];
export default function(){
 if(!token&&!sessionExhausted)issueSession();
 if(!token){sleep(10);return;}
 const x=Math.random();
 if(x<0.08)rpc('public_site_config',{},false);
 else if(x<0.13)rpc('mark_my_notifications_read');
 else rpc(reads[Math.floor(Math.random()*reads.length)]);
 sleep(1.5+Math.random()*2.5);
}