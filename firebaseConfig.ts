// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// --- QUAN TRỌNG ---
// THAY THẾ CÁC GIÁ TRỊ DƯỚI ĐÂY BẰNG CẤU HÌNH DỰ ÁN FIREBASE CỦA BẠN
// 1. Truy cập https://firebase.google.com/ và tạo một dự án mới.
// 2. Trong cài đặt dự án, tạo một "Web App".
// 3. Sao chép đối tượng cấu hình (firebaseConfig) và dán vào đây.
// 4. Vào mục "Realtime Database" trong menu Build, tạo database và copy URL vào "databaseURL".
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://y-te-truong-hoc-04850744-7365a-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:XXXXXXXXXXXXXXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
export const database = getDatabase(app);
