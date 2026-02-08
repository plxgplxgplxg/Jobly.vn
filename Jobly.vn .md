# **🌐 ĐẶC TẢ HỆ THỐNG WEBSITE JOBLY.VN (PHIÊN BẢN HOÀN THIỆN)**

## **I. Giới thiệu tổng quan**

**Jobly.vn** là một website thương mại điện tử trong lĩnh vực **tuyển dụng và tìm việc làm trực tuyến**, hoạt động 24/7 với mục tiêu **kết nối ứng viên và nhà tuyển dụng nhanh chóng, dễ sử dụng và đáng tin cậy**.

Hệ thống hướng đến:

* Sinh viên và người lao động phổ thông đang tìm việc.

* Doanh nghiệp nhỏ và vừa muốn đăng tin tuyển dụng không qua quy trình phức tạp.

**Hiệu năng & độ tin cậy:**

* Hỗ trợ đồng thời **500 người dùng**, phản hồi trung bình **\< 2 giây** (thường) và **\< 5 giây** (giờ cao điểm).

* Khả năng phục hồi sau sự cố trong **≤ 1 giờ**, hoạt động liên tục ít nhất **200 giờ không gián đoạn**.

  ---

  ## **II. Phạm vi và mục tiêu**

Jobly.vn cung cấp môi trường trung gian để:

| Đối tượng | Mục tiêu |
| ----- | ----- |
| Ứng viên (Candidate) | Tạo hồ sơ, tải CV, tìm kiếm và ứng tuyển việc làm. |
| Nhà tuyển dụng (Employer) | Đăng tin tuyển dụng, quản lý ứng viên, mua tin VIP. |
| Quản trị viên (Admin) | Duyệt tin, quản lý người dùng, thống kê và xử lý vi phạm. |

---

## **III. Các nhóm người dùng chính**

### **👩‍💼 1\. Ứng viên (Candidate)**

* Đăng ký / đăng nhập bằng email hoặc số điện thoại (xác thực OTP).

* Tạo hồ sơ cá nhân, có thể tải lên **nhiều CV khác nhau** để dùng khi ứng tuyển.

* Tìm kiếm việc làm, lọc theo vị trí, địa điểm, mức lương, loại hình.

* Ứng tuyển công việc bằng cách **chọn CV phù hợp**.

* Quản lý danh sách việc đã ứng tuyển, có thể **thu hồi hoặc cập nhật CV ứng tuyển**.

  ### **🏢 2\. Nhà tuyển dụng (Employer)**

* Tạo tài khoản công ty (tên, MST, lĩnh vực, email, logo).

* Đăng và quản lý tin tuyển dụng.

* **Mua tin đăng VIP** để ưu tiên hiển thị (qua **VietQR Payment Gateway**).

* Xem và xử lý hồ sơ ứng viên.

  ### **🧑‍💻 3\. Quản trị viên (Admin)**

* Quản lý tài khoản người dùng (xem, khóa/mở, cập nhật, cảnh báo, xóa).

* Duyệt tin tuyển dụng (bao gồm **tin VIP**).

* Xác minh thanh toán, kích hoạt trạng thái VIP.

* Quản lý vi phạm, thống kê hoạt động hệ thống.

  ---

  ## **IV. Chức năng chính (Functional Requirements)**

  ### **1️⃣ Ứng viên (Candidate)**

| Nhóm chức năng | Mô tả chi tiết |
| ----- | ----- |
| **Account Management** | Đăng ký / đăng nhập, xác thực OTP, cập nhật thông tin. |
| **Profile Management** | Tạo và cập nhật hồ sơ cá nhân, có thể **upload nhiều CV** (tùy chọn). |
| **Job Search** | Tìm kiếm theo từ khóa, ngành, địa điểm, mức lương. |
| **Apply Job** | Ứng tuyển bằng **CV được chọn** (use case `<<include>> Upload CV`). |
| **Manage Applied Jobs** | Xem, cập nhật CV đã ứng tuyển, thu hồi ứng tuyển (`<<extend>> Update Applied CV`). |

  ---

  ### **2️⃣ Nhà tuyển dụng (Employer)**

| Nhóm chức năng | Mô tả chi tiết |
| ----- | ----- |
| **Company Account Management** | Đăng ký tài khoản công ty, chỉnh sửa thông tin, logo, mật khẩu. |
| **Post Job** | Đăng tin tuyển dụng mới. |
| **Manage Job Posts** | Cập nhật, ẩn hoặc xóa tin (CRUD nội bộ). |
| **Purchase VIP Post** | `<<extend>>` từ *Post Job* – chọn gói VIP, thanh toán qua VietQR, gửi yêu cầu duyệt Admin. |
| **Make Payment via VietQR** | `<<include>>` – kết nối **VietQR Payment Gateway** để thanh toán phí đăng VIP. |
| **Request VIP Approval** | `<<include>>` – gửi yêu cầu duyệt tin VIP đến Admin. |
| **Manage Applicants** | Xem danh sách ứng viên, duyệt hoặc từ chối hồ sơ. |

  ---

  ### **3️⃣ Quản trị viên (Admin)**

| Nhóm chức năng | Mô tả chi tiết |
| ----- | ----- |
| **Manage Users** | `<<include>> View User List`, `<<extend>> Lock/Unlock Account`, `<<extend>> Update Info`, `<<extend>> Delete Account`, `<<extend>> Send Warning`. |
| **Approve Job Post** | Duyệt tin thường và `<<extend>> Approve VIP Post`. |
| **Approve VIP Post** | `<<include>> Verify Payment`, `<<include>> Activate VIP Tag`. |
| **Handle Violations** | Xử lý báo cáo vi phạm từ người dùng. |
| **View System Reports** | `<<extend>> View User Statistics`, `<<extend>> View Job Post Statistics`, `<<extend>> View Application Statistics`, `<<extend>> View System Activity Log`, `<<extend>> Export Report`. |

  ---

  ## **V. Yêu cầu phi chức năng**

| Thuộc tính | Mô tả |
| ----- | ----- |
| **Hiệu năng** | Thời gian phản hồi \< 2s (bình thường), \< 5s (cao điểm). |
| **Bảo mật** | Mã hóa mật khẩu, xác thực OTP, chống spam. |
| **Tính sẵn sàng** | Hoạt động 24/7, downtime \< 1 giờ/tháng. |
| **Mở rộng** | Hỗ trợ ≥ 500 người dùng đồng thời. |
| **Giao diện** | Responsive, thân thiện, hỗ trợ desktop & mobile. |
| **Ngôn ngữ** | Tiếng Việt, có thể mở rộng sang tiếng Anh. |

  ---

  ## **VI. Luồng chức năng chính (Functional Flows)**

| STT | Luồng chức năng | Mô tả |
| ----- | ----- | ----- |
| 1️⃣ | **Đăng ký tài khoản ứng viên** | Ứng viên điền form → Nhận OTP → Xác thực → Hoàn tất đăng ký. |
| 2️⃣ | **Ứng tuyển việc làm** | Ứng viên tìm việc → Chọn CV → Gửi đơn → Nhận thông báo thành công. |
| 3️⃣ | **Đăng tin tuyển dụng** | Employer đăng nhập → Tạo tin → Gửi duyệt → Admin duyệt → Tin hiển thị. |
| 4️⃣ | **Mua tin đăng VIP** | Employer chọn tin → `Purchase VIP Post` → Thanh toán VietQR → Gửi duyệt → Admin xác minh → Kích hoạt VIP. |
| 5️⃣ | **Duyệt tin VIP (Admin)** | Nhận yêu cầu → Kiểm tra thanh toán → Duyệt VIP → Gắn nhãn VIP → Tin hiển thị nổi bật. |
| 6️⃣ | **Quản lý người dùng (Admin)** | Xem danh sách, khóa/mở, cập nhật, cảnh báo hoặc xóa tài khoản. |
| 7️⃣ | **Xem báo cáo hệ thống** | Admin xem thống kê người dùng, tin, ứng tuyển, nhật ký và xuất báo cáo. |

  ---

  ## **VII. Cấu trúc dữ liệu chính (Entities)**

| Bảng | Trường chính | Ghi chú |
| ----- | ----- | ----- |
| **USERS** | id, tên, email, mật\_khẩu, vai\_trò | (Candidate / Employer / Admin) |
| **COMPANIES** | id, tên\_công\_ty, mã\_số\_thuế, lĩnh\_vực, logo | Gắn với Employer |
| **JOBS** | id, tiêu\_đề, mô\_tả, mức\_lương, hạn\_nộp, trạng\_thái, vip\_flag | `vip_flag` xác định tin thường hoặc VIP |
| **APPLICATIONS** | id, id\_ứng\_viên, id\_công\_việc, cv\_file, ngày\_nộp | Lưu ứng tuyển và CV đính kèm |
| **PAYMENTS** | id, id\_job, id\_employer, số\_tiền, phương\_thức, trạng\_thái, mã\_giao\_dịch | Ghi giao dịch VietQR |
| **ADMIN\_LOGS** | id, hành\_động, người\_thực\_hiện, thời\_gian | Ghi nhật ký quản trị |

  ---

  ## **VIII. Tích hợp hệ thống ngoài (External System)**

| External System | Mục đích | Tích hợp với Use Case |
| ----- | ----- | ----- |
| **VietQR Payment Gateway** | Xử lý thanh toán tin đăng VIP | `Make Payment via VietQR` |
| *(Tuỳ chọn)* PayPal Sandbox | Thanh toán quốc tế (phiên bản mở rộng) | `Make Payment via PayPal` *(optional)* |

  ---

  ## **IX. Công nghệ đề xuất**

| Thành phần | Công nghệ |
| ----- | ----- |
| **Frontend** | ReactJS / Next.js hoặc HTML \+ TailwindCSS |
| **Backend** | Node.js (Express) hoặc Laravel |
| **Database** | MySQL hoặc MongoDB |
| **Triển khai** | Docker, Nginx, VPS / Render / Railway |
| **Thanh toán** | VietQR API, PayPal Sandbox (option) |

  ---

  ## **X. Tổng quan Use Case Diagram (gợi ý sơ đồ vẽ trong Astah)**

  ### **🧩 1\. Use Case tổng quan (Overview)**

* Actor: Candidate, Employer, Admin

* Use case chính: Đăng ký, Ứng tuyển, Đăng tin, Quản lý người dùng, Quản lý hệ thống.

  ### **🧩 2\. Candidate**

* `Create Profile <<extend>> Upload CV`

* `Apply Job <<include>> Upload CV`

* `Manage Applied Jobs <<extend>> Update Applied CV <<include>> Upload CV`

  ### **🧩 3\. Employer**

* `Post Job <<extend>> Purchase VIP Post`

* `Purchase VIP Post <<include>> Make Payment via VietQR <<include>> Request VIP Approval`

* `Manage Job Posts`, `Manage Applicants`

  ### **🧩 4\. Admin**

* `Manage Users` (include \+ extend các hành vi con)

* `Approve Job Post <<extend>> Approve VIP Post`

* `Approve VIP Post <<include>> Verify Payment <<include>> Activate VIP Tag`

* `View System Reports <<extend>> (User Stats, Job Stats, Applications, Logs, Export)`

* `Handle Violations`

  ### **🧩 5\. External System**

* **VietQR Payment Gateway** — kết nối với *Make Payment via VietQR*.

  ---

👉 **Kết luận:**

Phiên bản đặc tả này phản ánh toàn bộ sơ đồ Use Case bạn đã xác định:  
 bao gồm Upload CV (extend/include đúng logic), Purchase VIP Post (với external VietQR), và luồng xử lý VIP giữa Employer ↔ Admin.  
 Đây là mô hình hoàn chỉnh, đúng chuẩn UML và đủ để nộp báo cáo *Requirement Modeling – Week 7–8*.

* 

