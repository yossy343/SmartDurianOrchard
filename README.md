# Smart Orchard - Starter Website

โครงเริ่มต้นเว็บไซต์ Smart Orchard แบบ Multi-page ด้วย HTML, CSS, JavaScript Modules และ Supabase

## โครงสร้าง
- `index.html` จุดเริ่มต้นไปหน้า Login
- `pages/` หน้า Login และหน้าหลัก 5 หน้า
- `css/style.css` รูปแบบกลาง
- `css/dashboard.css` รูปแบบเฉพาะ Dashboard
- `js/supabase.js` Supabase client
- `js/auth.js` ตรวจสอบ Session / Logout
- `js/common.js` Sidebar และ Header ร่วมกัน
- ไฟล์ JS รายหน้า

## ตั้งค่าก่อนใช้งาน
1. เปิด `js/supabase.js`
2. ใส่ Project URL และ Publishable Key ของ Supabase
3. ห้ามใส่ `service_role` หรือ Secret Key ใน Frontend
4. เปิดเว็บไซต์ผ่าน Local Web Server เช่น VS Code Live Server (ไม่ควรเปิดไฟล์ HTML ด้วยการดับเบิลคลิก)
5. Login ด้วยบัญชีผู้ใช้ที่มีอยู่ใน Supabase Auth

## หมายเหตุเรื่องฐานข้อมูล
Dashboard และ Monitoring อ่าน `plots`, `devices` และ `sensor_readings` ตาม schema ที่วางไว้
การอ่าน relation `devices(...)` ต้องมี Foreign Key ที่ PostgREST มองเห็นระหว่าง `sensor_readings.device_id` กับ `devices.id`
ถ้าตารางมี RLS ต้องตรวจสอบให้ผู้ใช้ที่ Login มีสิทธิ์ SELECT ตาม policy ที่กำหนดไว้

หน้า Orchard, Water Management และ AI Intelligence เป็น UI starter ยังไม่ได้เชื่อมการอ่าน/เขียนข้อมูลจริงทั้งหมด
การควบคุมปั๊ม/วาล์วและคำสั่ง AI ควรเรียก Backend/Edge Function ที่ตรวจสอบสิทธิ์ ไม่ควรเก็บ Secret Key ใน Browser

## ข้อควรระวัง
- Frontend ใช้ Publishable Key ได้เมื่อ RLS ตั้งค่าอย่างถูกต้อง
- อย่าเปิด RLS กว้างเพื่อแก้ปัญหาการอ่านข้อมูล
- ทดสอบด้วยบัญชี Admin และตรวจสอบ Console/Network หากมีข้อผิดพลาด
