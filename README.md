# Hệ Thống Quản Lý Hãng Vận Tải Hành Khách Đường Dài

> **Bài tập lớn môn Cơ sở Dữ liệu**  
> **Đề tài:** Xây dựng hệ thống quản lý một Hãng vận tải hành khách đường dài.

---

## 📌 1. Giới thiệu Đề tài

Hệ thống quản lý một hãng xe khách đường dài liên tỉnh, bao gồm việc quản trị phương tiện, nhân sự tổ lái (lái chính, phụ xe), mạng lưới tuyến đường và điều phối các chuyến xe thực tế.

### Các Quy tắc Nghiệp vụ Cốt lõi:
1. **Ràng buộc an toàn sức chứa:** Số lượng hành khách trên mỗi chuyến xe không được vượt quá số ghế quy định:
   $$\text{Số khách} \le \text{Số ghế thiết kế của xe} - 2$$
   *(2 ghế phía trước dành cho tổ lái)*.
2. **Nhân sự chuyến xe:** Mỗi chuyến xe có đúng 1 lái xe chính và 1 phụ xe cố định. Một nhân sự có thể tham gia nhiều chuyến xe với các vai trò khác nhau, nhưng trên cùng một chuyến thì $\text{Lái xe} \ne \text{Phụ xe}$.
3. **Phân cấp địa hình tuyến đường:** Gồm 3 cấp độ phức tạp:
   * **Cấp 1 (Đồng bằng / Cao tốc):** Hệ số đường khó $k_{\text{terrain}} = 1.0$.
   * **Cấp 2 (Trung du / Đồi dốc nhẹ):** Hệ số đường khó $k_{\text{terrain}} = 1.3$.
   * **Cấp 3 (Đèo núi hiểm trở):** Hệ số đường khó $k_{\text{terrain}} = 1.7$.
4. **Chính sách tính lương:** Lương tháng $= \sum 500.000 \times k_{\text{role}} \times k_{\text{terrain}}$ trên các chuyến **đã hoàn thành** (Lái chính gấp đôi Phụ xe: $k_{\text{role}} = 2.0$ vs $1.0$).
5. **Chu kỳ bảo dưỡng phương tiện:** Chu kỳ tối đa là 360 ngày. Cứ sau mỗi $100\text{ km}$ làm việc quy đổi ($= \text{km thực} \times k_{\text{terrain}}$), thời hạn bảo dưỡng giảm 1 ngày (chỉ tính chuyến đã hoàn thành, chu kỳ không nhỏ hơn 0). Các xe quá hạn (so với ngày hiện tại) được lọc vào danh sách cảnh báo riêng.
6. **Không trùng lịch:** Một xe, một lái xe hay phụ xe không được phân công cho hai chuyến (chưa hủy) có thời gian chồng lên nhau.

---

## 📂 2. Cấu trúc Thư mục Dự án

```
TransportationManagement/
├── .gitignore                          # Cấu hình bỏ qua các file tạm/rác
├── README.md                           # Giới thiệu & Hướng dẫn sử dụng
├── database/                           # Bộ 4 script MySQL (chạy theo thứ tự)
│   ├── 01_schema.sql                   # DDL tạo bảng, khóa chính, khóa ngoại, chỉ mục
│   ├── 02_triggers.sql                 # Trigger: số khách <= ghế-2, lái != phụ, chặn trùng lịch, đồng bộ ngày bảo dưỡng
│   ├── 03_sample_data.sql              # Dữ liệu mẫu (12 xe, 15 tài xế, 8 tuyến, 44 chuyến)
│   └── 04_views_and_procedures.sql     # Hàm, Stored Procedures & Views giải 3 bài toán truy vấn
├── backend/                            # REST API Spring Boot 4 (Java 21) - cổng 8080
└── frontend/                           # Giao diện quản trị React 19 + Vite + Tailwind - cổng 5173
```

> File báo cáo thiết kế (PDF/LaTeX) được nộp riêng, không nằm trong repo.

---

## ⚙️ 3. Hướng dẫn Cài đặt & Chạy

### Yêu cầu
* **MySQL 8.0.16+** (cần hỗ trợ ràng buộc `CHECK`)
* **JDK 21+** — biến `JAVA_HOME` phải trỏ tới JDK 21 trở lên (JDK 17 sẽ báo lỗi *class file version 65*)
* **Maven 3.9+** (hoặc `mvnw` có sẵn) và **Node.js 20+**

### Bước 1: Tạo CSDL
Chạy lần lượt 4 file trong thư mục `database/` (MySQL Workbench, DBeaver hoặc `mysql` CLI):

1. **`01_schema.sql`**: Tạo cơ sở dữ liệu `QuanLyVanTai` và 5 bảng (`XE`, `TAI_XE`, `TUYEN_XE`, `CHUYEN_XE`, `LICH_SU_BAO_DUONG`).
2. **`02_triggers.sql`**: Kích hoạt các Trigger kiểm tra toàn vẹn dữ liệu tự động.
3. **`03_sample_data.sql`**: Nạp dữ liệu mẫu (**xóa toàn bộ dữ liệu cũ** trong 5 bảng).
4. **`04_views_and_procedures.sql`**: Cài đặt hàm, Stored Procedure và View báo cáo.

> Chỉ cập nhật trigger / view mà không muốn mất dữ liệu: chạy lại riêng `02_triggers.sql` và `04_views_and_procedures.sql`.

### Bước 2: Chạy backend
Thông tin kết nối MySQL đọc từ biến môi trường, **không ghi mật khẩu vào file cấu hình**:

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `DB_PASSWORD` | *(bắt buộc)* | Mật khẩu MySQL |
| `DB_USERNAME` | `root` | Tài khoản MySQL |
| `DB_HOST` | `localhost` | Máy chủ MySQL |
| `DB_NAME` | `QuanLyVanTai` | Tên CSDL |

```bash
cd backend
DB_PASSWORD=<mat_khau_mysql> ./mvnw spring-boot:run
```

PowerShell: `$env:DB_PASSWORD="<mat_khau_mysql>"; .\mvnw spring-boot:run`. Chạy test: `./mvnw test` (cần CSDL đã tạo ở Bước 1).

### Bước 3: Chạy frontend
```bash
cd frontend
npm install
npm run dev
```
Mở http://localhost:5173 (Vite chuyển tiếp `/api` sang backend `http://localhost:8080`). Nếu backend chưa chạy, giao diện hiện thông báo lỗi kèm nút **Thử lại** thay vì dữ liệu giả.

---

## 📊 4. Các Câu lệnh Truy vấn Nghiệp vụ (Yêu cầu 2)

Sau khi nạp CSDL, bạn có thể kiểm tra kết quả 3 câu hỏi của bài tập lớn bằng các câu lệnh SQL sau:

### 🔹 Truy vấn 1: Tính Lương Tài xế Theo Tháng
```sql
USE QuanLyVanTai;
-- Tính lương cho tất cả tài xế trong tháng 10 năm 2026 (chỉ tính chuyến đã hoàn thành):
CALL sp_TinhLuongTaiXeThang(2026, 10);

-- Hoặc xem bảng lương của tháng hiện tại (theo ngày hệ thống) qua View:
SELECT * FROM v_BangLuongTaiXeHienTai;
```

### 🔹 Truy vấn 2: Thống kê Doanh thu theo Xe trong Khoảng thời gian
```sql
USE QuanLyVanTai;
-- Doanh thu các xe từ ngày 01/09/2026 đến ngày 31/10/2026:
CALL sp_BaoCaoDoanhThuTheoXe('2026-09-01', '2026-10-31');
```

### 🔹 Truy vấn 3: Dự báo Ngày bảo dưỡng & Danh sách Xe quá hạn
```sql
USE QuanLyVanTai;
-- Xem toàn bộ xe kèm ngày bảo dưỡng tiếp theo và số ngày còn lại:
CALL sp_DanhSachBaoDuongXe();

-- Xem danh sách riêng các xe ĐÃ QUÁ HẠN bảo dưỡng:
SELECT * FROM v_XeQuaHanBaoDuong;

-- Xem danh sách các xe AN TOÀN:
SELECT * FROM v_XeAnToan;
```

---

## 🔌 5. REST API chính (backend)

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| GET, POST | `/api/trips` | Danh sách / điều phối chuyến xe |
| GET, PUT, DELETE | `/api/trips/{id}` | Xem / sửa / xóa chuyến xe |
| GET, POST · PUT, DELETE | `/api/vehicles` · `/api/vehicles/{bienSo}` | Quản lý xe |
| GET, POST · PUT, DELETE | `/api/drivers` · `/api/drivers/{id}` | Quản lý tài xế |
| GET, POST · PUT, DELETE | `/api/routes` · `/api/routes/{id}` | Quản lý tuyến |
| GET | `/api/drivers/salaries?nam=&thang=` | Truy vấn 1 – lương (mặc định tháng hiện tại) |
| GET | `/api/vehicles/revenues?tuNgay=&denNgay=` | Truy vấn 2 – doanh thu (mặc định tháng hiện tại) |
| GET | `/api/maintenances/status` · `/overdue` · `/safe` | Truy vấn 3 – bảo dưỡng |
| GET, POST | `/api/maintenances` | Lịch sử / ghi nhận bảo dưỡng |

Mã lỗi: `400` dữ liệu sai hoặc vi phạm quy tắc nghiệp vụ (kể cả lỗi từ trigger), `404` không tìm thấy, `409` trùng dữ liệu hoặc xóa bản ghi đang được chuyến xe sử dụng.

---
*Đồ án môn Cơ sở Dữ liệu — Năm 2026*
