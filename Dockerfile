# เลือก Base Image ที่เหมาะสมสำหรับ Node.js
FROM node:20.5.1

# สร้างไดเร็กทอรี app ใน Docker container และเปลี่ยน directory ไปยัง /usr/src/app
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# คัดลอกไฟล์ package.json และ package-lock.json จากโปรเจกต์ Express ลงใน Docker container
COPY package*.json ./

# ติดตั้ง dependencies ของ Express โปรเจกต์
RUN npm install

# คัดลอกโค้ดของ Express โปรเจกต์จากโปรเจกต์ใน VSCode ลงใน Docker container
COPY . .

# เปิดพอร์ต 9000 เพื่อให้ Express โปรเจกต์ของคุณรับคำขอ HTTP ได้
EXPOSE 9000

# กำหนดคำสั่งเริ่มต้นเมื่อ Docker container ถูกสร้างขึ้นมา
CMD ["node", "influxsvr.js"]
