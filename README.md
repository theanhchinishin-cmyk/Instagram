# Instagram Clone - Full Stack Web Application

Đây là một dự án **Instagram Clone** hoàn chỉnh, được xây dựng với mục tiêu tái hiện lại các trải nghiệm cốt lõi của mạng xã hội Instagram. Ứng dụng cho phép người dùng kết nối, chia sẻ hình ảnh và theo dõi hoạt động của bạn bè thông qua giao diện hiện đại và mượt mà.

## 🚀 Công nghệ sử dụng
*   **Backend:** Node.js, Express.
*   **Frontend Engine:** EJS (Embedded JavaScript Templates).
*   **Database:** SQLite (Sử dụng module `node:sqlite` hiện đại).
*   **Styling:** CSS3 (BEM Methodology, Responsive Design).
*   **Xử lý hình ảnh:** Multer (Xử lý file upload trực tiếp).
*   **Real-time:** Socket.io (Hỗ trợ cập nhật Feed và thông báo tức thời).

## ✨ Chức năng chính (Features)

### 🔐 Hệ thống xác thực (Authentication)
*   Đăng ký tài khoản mới (Username, email và mật khẩu được mã hóa bằng bcrypt).
*   Đăng nhập phiên (session-based) an toàn.

### 📸 Quản lý bài đăng (Post Management)
*   Tạo bài đăng mới kèm hình ảnh và chú thích (caption).
*   Hệ thống lưu trữ ảnh tối ưu trên server.
*   Tương tác: Thả tim (Like) và Bình luận (Comment) trên từng bài viết.

### 👤 Trang cá nhân (User Profile)
*   Hiển thị thông tin cá nhân, tiểu sử (bio).
*   Chế độ xem lưới (Grid View) đặc trưng của Instagram.
*   Chỉnh sửa thông tin cá nhân và thay đổi ảnh đại diện.

### 🤝 Hệ thống tương tác (Social Interaction)
*   **Follow/Unfollow:** Theo dõi người dùng khác để xây dựng vòng kết nối.
*   **Personalized Feed:** Bảng tin thông minh hiển thị bài đăng từ những người bạn theo dõi.
*   **Stories Rail:** Hiển thị danh sách story từ những người đang follow ngay đầu trang Feed.
*   **Explore:** Khám phá các bài viết phổ biến và tìm kiếm người dùng mới.

### ⚡ Tính năng nâng cao (Bonus)
*   **Auto-refresh Feed:** Cập nhật nội dung mới không cần tải lại trang.
*   **Direct Messaging:** Hệ thống trò chuyện giữa các người dùng.
*   **Dark/Light Mode:** Hỗ trợ giao diện sáng/tối tùy biến theo sở thích.

## 🎨 Giao diện (UI/UX)
*   **Thiết kế:** Tối giản, hiện đại, bám sát trải nghiệm nguyên bản của Instagram.
*   **Hiệu ứng:** Hiệu ứng Double-tap để like, Skeleton loading, và các animation mượt mà bằng CSS.
*   **Responsive:** Hoạt động hoàn hảo trên Mobile, Tablet và Desktop.

## 🛠 Cách cài đặt và khởi chạy

### 1. Clone dự án
```bash
git clone [link-github-cua-ban]
cd instagram-clone
```

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Cấu hình môi trường
Tạo file `.env` và thêm các biến cần thiết:
```env
PORT=3000
SESSION_SECRET=your_secret_key_here
```

### 4. Khởi chạy ứng dụng
```bash
# Chạy chế độ Production
npm start

# Chạy chế độ Development (Yêu cầu Nodemon)
npm run dev
```

### 5. Truy cập
Mở trình duyệt và truy cập: `http://localhost:3000`

---
*Dự án được xây dựng với tiêu chuẩn mã nguồn sạch, dễ dàng mở rộng và bảo trì.* 
*Phát triển bởi chuyên gia Full-stack Web Engineering.*
