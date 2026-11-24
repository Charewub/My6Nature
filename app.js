import {downloadReport} from './report.js';
const el = id => document.getElementById(id);
let results = [], groups = {}, current;
const formatDate = t => t ? new Date(t).toLocaleDateString('th-TH',{timeZone:'Asia/Bangkok',dateStyle:'long'}) : 'ไม่ระบุวันที่';
function show(index){
 current=results[index];
 const style=groups[current.group] || {color:'#59665e',ink:'white',definition:''};
 el('result').style.setProperty('--accent',style.color);
 el('result').style.setProperty('--ink',style.ink);
 el('title').textContent='ผลประเมินของ'+(current.nickname||current.name||'คุณ');
 el('group').textContent=current.group||'ไม่ระบุกลุ่ม';
 el('definition').textContent=style.definition;
 el('list').replaceChildren(...current.top5.map(value=>{const li=document.createElement('li');li.textContent=value;return li}));
 el('message').textContent='';
}
const firebaseConfig = {
  apiKey: "AIzaSyCt1sthAka7e96OOv7y0IKnlip3pilA-00",
  authDomain: "st90-eef97.firebaseapp.com",
  projectId: "st90-eef97",
  storageBucket: "st90-eef97.firebasestorage.app",
  messagingSenderId: "381519034066",
  appId: "1:381519034066:web:16e5e46300be11bbe4df0b",
  measurementId: "G-RSF17XFT0L"
};
const normalize = value => String(value ?? '').trim().toLowerCase();
let records = [];
async function preload(){
 const submit = document.querySelector('form button');
 submit.disabled = true;
 el('retry').hidden = true;
 el('loading').hidden = false;
 el('notice').textContent = '';
 try {
  const [sdk, store, palette] = await Promise.all([
   import('https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js'),
   fetch('groups.json')
  ]);
  if (!palette.ok) throw Error('palette');
  groups = await palette.json();
  const db = store.getFirestore(sdk.getApps()[0] || sdk.initializeApp(firebaseConfig));
  const snapshot = await store.getDocs(store.collection(db,'assessments'));
  records = snapshot.docs.map(doc => {
   const d=doc.data();
   return {emails:[d.email,d.employeeEmail,d.emailAddress].map(normalize).filter(Boolean),
    name:d.employeeName || '', nickname:d.nickname || d.nickName || d.employeeNickname || d.employeeNickName || '',
    group:d.dominantGroup || '', top5:Array.isArray(d.top5)?d.top5.filter(v=>typeof v==='string').slice(0,5):[],
    time:d.timestamp?.toMillis?.() || Date.parse(d.timestamp) || 0};
  }).sort((a,b)=>b.time-a.time);
  submit.disabled=false;
 } catch(error) {
  el('notice').textContent=error.code==='permission-denied'?'Firestore ยังไม่อนุญาตให้หน้านี้อ่านผลประเมิน':'โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ';
  el('retry').hidden=false;
 } finally {el('loading').hidden=true}
}
el('retry').onclick=preload;
document.querySelector('form').onsubmit=event=>{
 event.preventDefault();
 const email=normalize(el('email').value);
 results=records.filter(row=>row.emails.includes(email));
 el('notice').textContent='';
  if(!results.length){el('notice').textContent='ไม่พบผลประเมิน กรุณาตรวจสอบอีเมลที่ใช้ตอบแบบประเมิน';return}
  el('history').replaceChildren(...results.map((r,i)=>new Option(formatDate(r.time)+' · ครั้งที่ '+(results.length-i),i)));
  el('history').hidden=results.length<2;show(0);
  el('entry').hidden=true;el('result').hidden=false;window.scrollTo(0,0);
};
preload();
el('history').onchange=()=>show(Number(el('history').value));
el('back').onclick=()=>{el('result').hidden=true;el('entry').hidden=false;el('email').focus()};
el('pdf').onclick=async()=>{try{await downloadReport(current,groups[current.group],formatDate(current.time))}catch{el('message').textContent='สร้าง PDF ไม่สำเร็จ กรุณาลองอีกครั้ง'}};
el('book').onclick=async event=>{
 event.preventDefault();
 const url=el('book').href;
 try{
  const response=await fetch(url,{method:'HEAD'});
  if(!response.ok||!response.headers.get('content-type')?.includes('pdf'))throw Error();
  const link=document.createElement('a');link.href=url;link.download='6Nature-Strengths-Book.pdf';link.click();
 }catch{el('message').textContent='ยังดาวน์โหลดหนังสือไม่ได้ กรุณาติดต่อผู้จัดกิจกรรม'}
};
