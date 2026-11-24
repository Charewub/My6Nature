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
document.querySelector('form').onsubmit=async event=>{
 event.preventDefault();
 el('loading').hidden=false;
 el('notice').textContent='';
 try{
  const [response,palette]=await Promise.all([fetch(location.origin === 'https://charewub.github.io' ? 'https://asia-southeast1-st90-eef97.cloudfunctions.net/sixNatureResults/lookup' : 'lookup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:el('email').value.trim()})}),fetch('groups.json')]);
  if(!response.ok||!palette.ok)throw Error();
  results=await response.json();groups=await palette.json();
  if(!results.length){el('notice').textContent='ไม่พบผลประเมิน กรุณาตรวจสอบอีเมลที่ใช้ตอบแบบประเมิน';return}
  el('history').replaceChildren(...results.map((r,i)=>new Option(formatDate(r.time)+' · ครั้งที่ '+(results.length-i),i)));
  el('history').hidden=results.length<2;show(0);
  el('entry').hidden=true;el('result').hidden=false;window.scrollTo(0,0);
 }catch{el('notice').textContent='ติดต่อระบบค้นหาผลไม่ได้ กรุณาลองใหม่หรือติดต่อผู้จัดกิจกรรม'}
 finally{el('loading').hidden=true}
};
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
