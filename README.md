# 📄 Document Signature App (I Love PDF Style)

A full-stack **Document Signature Application** inspired by I Love PDF, where users can upload PDFs, assign multiple signers, send email invitations, and collect digital signatures securely.

---

## 👩‍💻 Author
**Roma Sanyal**

---

## 🚀 Live Demo

### Frontend (Vercel)
🔗 https://document-signature-frontend-mu.vercel.app

### Backend (Render)
🔗 https://document-signature-backend-kfb4.onrender.com

---

## 📂 GitHub Repositories

### Frontend
🔗 https://github.com/romasanyal05/document-signature-frontend

### Backend
🔗 https://github.com/romasanyal05/document-signature-backend

---

## 🎥 Project Demo Video
📹 **Video recording & troubleshooting video is available in the Drive link**  
*(Shared separately as per submission instructions)*

---

## ✨ Features

- 📤 Upload PDF documents
- ✍️ Draw or Type digital signatures
- 👥 Assign **multiple signers** to one document
- ⏳ Sequential signing (Pending → Waiting → Signed)
- 📧 Email invitations via **SMTP (Brevo)**
- 🔐 Secure sign links using **JWT tokens**
- 📄 Signed PDF download & storage
- 📊 Dashboard with **All / Pending / Signed** status
- ☁️ Supabase Storage & Database
- 🔑 Authentication with Supabase Auth

---

## 🛠️ Tech Stack

### Frontend
- React + TypeScript (Vite)
- Supabase Auth & Storage
- PDF-lib
- React Router

### Backend
- Node.js + Express
- Nodemailer (SMTP – Brevo)
- JWT Authentication

### Database & Storage
- Supabase (PostgreSQL + Storage Buckets)

---

## 🔐 Security Highlights

- JWT-based secure invite links
- Email-only access to signing links
- Link expiry handling
- Role-based document access

---

## 📌 Notes for Evaluators

- The application supports **multi-signer workflows** on a single PDF.
- Email invitations are sent in real time using SMTP.
- The project is demonstrated using screen recording (shared via Drive).
- Localhost links are used in demo video due to deployment environment constraints.

---

## ✅ Project Status
**Completed & Deployed** 🎉  
Ready for submission and evaluation.
