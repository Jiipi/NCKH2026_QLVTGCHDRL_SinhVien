# BÀI THỰC HÀNH SỐ 1
## BẢN TÔN CHỈ DỰ ÁN

**I. Mục tiêu:**
- Hiểu và xây dựng bản tôn chỉ cho dự án.

**II. Hướng dẫn thực hành:**
1. Sinh viên đọc hiểu và viết lại bản tôn chỉ:

---

# PROJECT CHARTER

## 1.0 PROJECT IDENTIFICATION

| Thành phần | Chi tiết |
|------------|----------|
| **Project Name** | **DevOps** |
| **Description** | Design, develop and implement a comprehensive DevOps infrastructure including CI/CD pipelines, containerization, infrastructure as code, automated testing, monitoring, and deployment automation for enterprise software development |
| **Project Sponsor** | Trường Đại học Đà Lạt - Phòng Công tác Sinh viên |
| **Project Manager** | 2212391 – Nguyễn Hoàng Nam Khánh |
| **Project Team** | - 2212377 – Trần Ngọc Hưng – DevOps Engineer<br>- 2212410 – Trần Vũ Thành Luân – Cloud Infrastructure Engineer<br>- 2213795 – Nguyễn Thị Hoàng Phúc - Site Reliability Engineer<br>- 2212407 – Hoàng Long - UI/UX Security Engineer |
| **Resources** | - Ngân sách: [Số tiền] VNĐ<br>- Nhân sự: 5 thành viên<br>- Công nghệ: Docker, Kubernetes, Jenkins/GitLab CI, Terraform, AWS/Azure<br>- Thiết bị: Cloud servers, máy tính phát triển, monitoring tools |
| **Communications** | - Email: [email dự án]<br>- Họp định kỳ: Daily standup, Sprint review<br>- Công cụ: Slack, Jira, Confluence |

---

## 2.0 BUSINESS REASONS FOR PROJECT

*   **Tăng tốc độ phát hành sản phẩm**: Giảm thời gian từ development đến production từ tuần xuống giờ thông qua CI/CD automation.
*   **Giảm thiểu lỗi do triển khai thủ công**: Tự động hóa quy trình deployment để loại bỏ human error và đảm bảo consistency.
*   **Cải thiện khả năng mở rộng**: Xây dựng infrastructure có thể scale theo nhu cầu với container orchestration.
*   **Tối ưu hóa chi phí vận hành**: Sử dụng cloud resources hiệu quả, giảm downtime và chi phí maintenance.
*   **Đáp ứng yêu cầu bảo mật**: Tích hợp security vào pipeline (DevSecOps) để phát hiện vulnerabilities sớm.

---

## 3.0 PROJECT OBJECTIVES (PURPOSE)

*   **CI/CD Pipeline**: Xây dựng pipeline tự động cho build, test, và deploy với Jenkins/GitLab CI.
*   **Containerization**: Đóng gói ứng dụng với Docker và quản lý với Kubernetes.
*   **Infrastructure as Code**: Triển khai Terraform/Ansible để quản lý infrastructure một cách có version control.
*   **Automated Testing**: Tích hợp unit tests, integration tests, và security scans vào pipeline.
*   **Monitoring & Logging**: Thiết lập hệ thống monitoring với Prometheus, Grafana, ELK Stack.
*   **DevSecOps**: Tích hợp security scanning (SAST, DAST) vào CI/CD pipeline.

---

## 4.0 PROJECT SCOPE

### Included in Scope:
*   **CI/CD Pipeline**
    *   Thiết lập Jenkins/GitLab CI server
    *   Tạo pipeline cho build, test, deploy
    *   Cấu hình webhooks và triggers
*   **Containerization & Orchestration**
    *   Viết Dockerfile cho các services
    *   Thiết lập Kubernetes cluster (K8s)
    *   Cấu hình Helm charts cho deployment
*   **Infrastructure as Code (IaC)**
    *   Terraform scripts cho cloud infrastructure
    *   Ansible playbooks cho configuration management
    *   Version control cho infrastructure
*   **Automated Testing**
    *   Unit test integration
    *   Integration test automation
    *   Performance testing với JMeter/Locust
*   **Monitoring & Observability**
    *   Prometheus + Grafana dashboards
    *   ELK Stack (Elasticsearch, Logstash, Kibana)
    *   Alerting và on-call rotation
*   **Security (DevSecOps)**
    *   SAST scanning với SonarQube
    *   Container vulnerability scanning
    *   Secret management với HashiCorp Vault

### Not Included in Scope:
*   Phát triển mã nguồn tính năng nghiệp vụ (Business Logic)
*   Đào tạo người dùng cuối (End-users)
*   Mua sắm thiết bị phần cứng (Server vật lý)

---

## 5.0 KEY PROJECT DELIVERABLES

| Name | Description |
|------|-------------|
| **CI/CD Pipeline Documentation** | Tài liệu thiết kế và hướng dẫn sử dụng pipeline |
| **Docker Images** | Dockerfile và container images cho tất cả services |
| **Kubernetes Manifests** | K8s deployment, service, ingress configurations |
| **Helm Charts** | Packaged Helm charts cho easy deployment |
| **Terraform Modules** | Reusable Terraform modules cho cloud infrastructure |
| **Ansible Playbooks** | Automation scripts cho server configuration |
| **Monitoring Dashboards** | Grafana dashboards cho system và application metrics |
| **Security Scan Reports** | SAST, DAST, và vulnerability reports |
| **Runbook Documentation** | Operational runbooks cho incident response |
| **Training Materials** | Tài liệu đào tạo team về DevOps practices |

---

## 6.0 MILESTONE DATES

| # | Major Events / Milestones | Dates |
|---|---------------------------|-------|
| 1 | Khởi động dự án & Phân tích yêu cầu | 01/09/2025 - 15/09/2025 |
| 2 | Thiết kế kiến trúc DevOps | 16/09/2025 - 30/09/2025 |
| 3 | Thiết lập CI/CD Pipeline cơ bản | 01/10/2025 - 31/10/2025 |
| 4 | Containerization với Docker | 01/11/2025 - 15/11/2025 |
| 5 | Triển khai Kubernetes Cluster | 16/11/2025 - 30/11/2025 |
| 6 | Infrastructure as Code (Terraform) | 01/12/2025 - 15/12/2025 |
| 7 | Thiết lập Monitoring & Logging | 16/12/2025 - 31/12/2025 |
| 8 | DevSecOps Integration | 01/01/2026 - 15/01/2026 |
| 9 | Testing & Optimization | 16/01/2026 - 31/01/2026 |
| 10 | Production Deployment | 01/02/2026 - 15/02/2026 |
| 11 | Handover & Training | 16/02/2026 - 28/02/2026 |

---

## 7.0 KEY ISSUES

| Severity | Description |
|----------|-------------|
| **High** | Độ phức tạp của Kubernetes trong môi trường production |
| **High** | Legacy applications không tương thích với containerization |
| **High** | Security vulnerabilities trong CI/CD pipeline |
| **Medium** | Chi phí cloud infrastructure vượt ngân sách |
| **Medium** | Thiếu kỹ năng DevOps trong team hiện tại |
| **Medium** | Downtime trong quá trình migration |

---

## 8.0 RISKS

| Severity | Description |
|----------|-------------|
| **Critical** | Pipeline failure gây block toàn bộ team |
| **High** | Security breach do misconfigured infrastructure |
| **High** | Kubernetes cluster instability |
| **Medium** | Vendor lock-in với cloud provider |
| **Medium** | Data loss do container crash |
| **Medium** | Team resistance to new DevOps practices |
| **Medium** | Integration issues với existing tools |

---

## 9.0 PROJECT’S CRITERIA FOR SUCCESS (MUST BE MEASURABLE)

*   **Deployment Frequency**: Số lần deploy production / tuần ≥ 10 deployments/tuần
*   **Lead Time for Changes**: Thời gian từ commit đến production ≤ 1 giờ
*   **Mean Time to Recovery (MTTR)**: Thời gian khôi phục sau incident ≤ 30 phút
*   **Change Failure Rate**: % deployment gây lỗi production ≤ 5%
*   **Pipeline Success Rate**: % pipeline runs thành công ≥ 95%
*   **Infrastructure Uptime**: Thời gian hệ thống hoạt động ≥ 99.9%
*   **Security Vulnerabilities**: Số critical vulnerabilities 0 trong production
*   **Cost Optimization**: Giảm chi phí infrastructure so với trước ≥ 20% giảm

---

## 10.0 CRITICAL SUCCESS FACTORS

*   **Sự hỗ trợ từ lãnh đạo**: Cam kết từ CTO và IT Management; Phân bổ nguồn lực và ngân sách cho infrastructure.
*   **Hiểu rõ quy trình hiện tại**: Phân tích workflow development hiện tại; Xác định bottlenecks và pain points.
*   **Năng lực kỹ thuật của team**: Thành viên có kiến thức về Docker, Kubernetes, CI/CD; Hiểu biết về Cloud platforms (AWS/Azure/GCP).
*   **Áp dụng DevOps Culture**: Phá bỏ silos giữa Dev và Ops; Encourage collaboration và shared responsibility.
*   **Giao tiếp và Training hiệu quả**: Training team về DevOps practices; Documentation rõ ràng và cập nhật.
*   **Security-first mindset**: Tích hợp security vào mọi giai đoạn (Shift-left); Regular security audits và updates.
*   **Metrics-driven approach**: Theo dõi DORA metrics; Continuous improvement dựa trên data.
*   **Automation mindset**: Automate everything possible; Infrastructure as Code approach.

---

## 11.0 SIGNOFF

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Project Sponsor** | [Họ tên - CTO/IT Director] | ____/____/2026 | _______________ |
| **Project Manager** | 2212391 – Nguyễn Hoàng Nam Khánh | ____/____/2025 | _______________ |
| **Lead DevOps Engineer** | 2212377 – Trần Ngọc Hưng | ____/____/2025 | _______________ |
| **Giảng viên hướng dẫn** | [Họ tên GVHD] | ____/____/2025 | _______________ |

---

## III. Bài tập nhóm (Trả lời câu hỏi)

### 2. Yêu cầu của bản tôn chỉ dự án gồm những thành phần chính nào?

**Bản tôn chỉ dự án (Project Charter) gồm 11 thành phần chính:**

1.  **Project Identification**: Xác định tên dự án, mô tả, người tài trợ, PM, team, tài nguyên, liên lạc.
2.  **Business Reasons for Project**: Lý do kinh doanh/nhu cầu thực tế để thực hiện dự án.
3.  **Project Objectives/Purpose**: Mục tiêu chung và các mục tiêu cụ thể của dự án.
4.  **Project Scope**: Phạm vi công việc bao gồm và không bao gồm trong dự án.
5.  **Key Project Deliverables**: Các sản phẩm/bàn giao chính của dự án.
6.  **Milestone Dates**: Các mốc thời gian quan trọng trong dự án.
7.  **Key Issues**: Các vấn đề chính cần giải quyết.
8.  **Risks**: Các rủi ro tiềm ẩn và kế hoạch giảm thiểu.
9.  **Project Criteria for Success**: Tiêu chí thành công (phải đo lường được).
10. **Critical Success Factors**: Yếu tố then chốt để dự án thành công.
11. **Signoff**: Ký xác nhận từ các stakeholder chính.
