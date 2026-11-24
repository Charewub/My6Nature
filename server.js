const express = require('express');
const path = require('node:path');
const {onRequest} = require('firebase-functions/v2/https');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');
initializeApp();
const app = express();
app.disable('x-powered-by');
app.use(express.json({limit:'2kb'}));
app.post('/lookup', async (req,res) => {
  res.set('Cache-Control','no-store');
  const email = String(req.body?.email || '').trim();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.sendStatus(400);
  try {
    const variants = [...new Set([email,email.toLowerCase()])];
    const assessments = getFirestore().collection('assessments');
    const snapshots = await Promise.all(['email','employeeEmail','emailAddress'].map(key => assessments.where(key,'in',variants).get()));
    const found = new Map();
    for (const snapshot of snapshots) for (const doc of snapshot.docs) {
      const d = doc.data();
      found.set(doc.id, {
        name:String(d.employeeName || ''), nickname:String(d.nickname || d.nickName || d.employeeNickname || d.employeeNickName || ''),
        group:String(d.dominantGroup || ''), top5:Array.isArray(d.top5)? d.top5.filter(x=>typeof x==='string').slice(0,5):[],
        time:d.timestamp?.toMillis?.() || Date.parse(d.timestamp) || 0
      });
    }
    res.json([...found.values()].sort((a,b)=>b.time-a.time));
  } catch { res.status(503).json({error:'lookup_unavailable'}); }
});
const site = path.join(__dirname,'site');
app.use(express.static(site));
exports.sixNatureResults = onRequest({cors:['https://charewub.github.io'],region:'asia-southeast1',maxInstances:5,invoker:'public'},app);
