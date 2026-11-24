6NATURE Strengths – เว็บผลรายบุคคล
ต้องใช้ Firebase CLI, Node.js 22 และบัญชีที่มีสิทธิ์ deploy Cloud Functions ในโปรเจกต์ st90-eef97 พร้อมเปิด billing สำหรับ Functions
1. ใส่หนังสือจริงใน functions/site/books/signature-strengths.pdf ก่อน deploy
2. จากโฟลเดอร์ที่มี firebase.json รัน npm install --prefix functions
3. firebase login
4. firebase deploy --only functions:sixNatureResults --project st90-eef97
5. ใช้ Function URL ที่ CLI แสดงเป็นลิงก์ผู้เข้าร่วม (เติม / ท้าย URL ได้)
ฟังก์ชันนี้ให้บริการเว็บและ lookup ใน origin เดียวกัน ใช้ Admin SDK ผ่าน runtime service account ที่ต้องมีสิทธิ์อ่าน Firestore โปรเจกต์เดิม ไม่ต้องแก้ Hosting หรือ Rules ของหน้า Admin
ระบบตรวจอีเมลตรงตัวและตัวพิมพ์เล็กใน email / employeeEmail / emailAddress ถ้าข้อมูลเดิมบันทึกตัวพิมพ์ผสม ให้กรอกตรงตามเดิมหรือปรับอีเมลที่เก็บเป็นตัวเล็กผ่าน Admin
หน้าเว็บค้นด้วยอีเมลอย่างเดียว ผู้ที่ทราบอีเมลจึงเปิดผลของอีเมลนั้นได้
