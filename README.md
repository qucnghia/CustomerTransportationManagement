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
4. **Chính sách tính lương:** Lương tháng tính dựa trên số chuyến, vai trò (Lái chính gấp đôi Phụ xe: $k_{\text{role}} = 2.0$ vs $1.0$), và độ phức tạp của tuyến đường.
5. **Chu kỳ bảo dưỡng phương tiện:** Chu kỳ tối đa là 360 ngày. Cứ sau mỗi $100\text{ km}$ làm việc quy đổi ($= \text{km thực} \times k_{\text{terrain}}$), thời hạn bảo dưỡng giảm 1 ngày. Các xe quá hạn bảo dưỡng được lọc vào danh sách cảnh báo riêng.

---

## 📂 2. Cấu trúc Thư mục Dự án

```
TransportationManagement/
├── .gitignore                          # Cấu hình bỏ qua các file tạm/rác
├── README.md                           # Giới thiệu & Hướng dẫn sử dụng
├── BaoCao_CSDL_VanTaiHanhKhach.pdf     # YÊU CẦU 1: File Báo cáo thiết kế PDF hoàn chỉnh
├── BaoCao_CSDL_VanTaiHanhKhach.tex     # Mã nguồn LaTeX đầy đủ (có sơ đồ TikZ)
└── database/                           # YÊU CẦU 2: Bộ 4 script MySQL
    ├── 01_schema.sql                   # DDL tạo bảng, khóa chính, khóa ngoại, chỉ mục
    ├── 02_triggers.sql                 # Triggers chặn số khách > ghế-2, chặn trùng tài xế
    ├── 03_sample_data.sql              # Dữ liệu mẫu thực tế, phong phú (50+ chuyến)
    └── 04_views_and_procedures.sql     # Stored Procedures & Views giải 3 bài toán truy vấn
```

---

## ⚙️ 3. Hướng dẫn Cài đặt & Chạy CSDL MySQL

### Bước 1: Khởi động MySQL
Mở MySQL Workbench, DBeaver, phpMyAdmin hoặc Terminal MySQL Client.

### Bước 2: Thực thi các script theo đúng thứ tự
Chạy lần lượt 4 file trong thư mục `database/`:

1. **`01_schema.sql`**: Tạo cơ sở dữ liệu `QuanLyVanTai` và 5 bảng (`XE`, `TAI_XE`, `TUYEN_XE`, `CHUYEN_XE`, `LICH_SU_BAO_DUONG`).
2. **`02_triggers.sql`**: Kích hoạt các Trigger kiểm tra toàn vẹn dữ liệu tự động.
3. **`03_sample_data.sql`**: Nạp dữ liệu mẫu phong phú (12 xe, 15 tài xế, 8 tuyến đường, hơn 50 chuyến xe).
4. **`04_views_and_procedures.sql`**: Cài đặt các Stored Procedure và View báo cáo.

---

## 📊 4. Các Câu lệnh Truy vấn Nghiệp vụ (Yêu cầu 2)

Sau khi nạp CSDL, bạn có thể kiểm tra kết quả 3 câu hỏi của bài tập lớn bằng các câu lệnh SQL sau:

### 🔹 Truy vấn 1: Tính Lương Tài xế Theo Tháng
```sql
USE QuanLyVanTai;
-- Tính lương cho tất cả tài xế trong tháng 10 năm 2026:
CALL sp_TinhLuongTaiXeThang(2026, 10);

-- Hoặc xem bảng lương tháng hiện tại qua View:
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

## 📄 5. Báo cáo & Tài liệu Thiết kế (Yêu cầu 1)

* **File PDF chính thức:** [`BaoCao_CSDL_VanTaiHanhKhach.pdf`](BaoCao_CSDL_VanTaiHanhKhach.pdf) sẵn sàng in ấn và nộp bài.
* **File nguồn LaTeX:** [`BaoCao_CSDL_VanTaiHanhKhach.tex`](BaoCao_CSDL_VanTaiHanhKhach.tex) có thể biên dịch trực tiếp trên [Overleaf](https://www.overleaf.com) hoặc bằng công cụ `pdflatex`.

---
*Đồ án môn Cơ sở Dữ liệu — Năm 2026*
