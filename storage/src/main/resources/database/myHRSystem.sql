/*
 Navicat Premium Dump SQL

 Source Server         : root
 Source Server Type    : MySQL
 Source Server Version : 90200 (9.2.0)
 Source Host           : localhost:3306
 Source Schema         : myHRSystem

 Target Server Type    : MySQL
 Target Server Version : 90200 (9.2.0)
 File Encoding         : 65001

 Date: 07/11/2025 10:02:55
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for employee_archive
-- ----------------------------
DROP TABLE IF EXISTS `employee_archive`;
CREATE TABLE `employee_archive` (
  `archive_id` bigint NOT NULL AUTO_INCREMENT COMMENT '档案ID',
  `archive_number` varchar(18) NOT NULL COMMENT '档案编号（年份4位+一级机构2位+二级机构2位+三级机构2位+编号2位）',
  `name` varchar(50) NOT NULL COMMENT '姓名',
  `gender` varchar(10) DEFAULT NULL COMMENT '性别：MALE(男), FEMALE(女)',
  `id_number` varchar(18) DEFAULT NULL COMMENT '身份证号码',
  `birthday` date DEFAULT NULL COMMENT '出生日期',
  `age` int DEFAULT NULL COMMENT '年龄',
  `nationality` varchar(50) DEFAULT '中国' COMMENT '国籍',
  `place_of_birth` varchar(100) DEFAULT NULL COMMENT '出生地',
  `ethnicity` varchar(50) DEFAULT NULL COMMENT '民族',
  `religious_belief` varchar(100) DEFAULT NULL COMMENT '宗教信仰',
  `political_status` varchar(50) DEFAULT NULL COMMENT '政治面貌',
  `education_level` varchar(50) DEFAULT NULL COMMENT '学历',
  `major` varchar(100) DEFAULT NULL COMMENT '学历专业',
  `email` varchar(100) DEFAULT NULL COMMENT 'Email',
  `phone` varchar(20) DEFAULT NULL COMMENT '电话',
  `qq` varchar(20) DEFAULT NULL COMMENT 'QQ',
  `mobile` varchar(20) DEFAULT NULL COMMENT '手机',
  `address` varchar(500) DEFAULT NULL COMMENT '住址',
  `postal_code` varchar(10) DEFAULT NULL COMMENT '邮编',
  `hobby` text COMMENT '爱好',
  `personal_resume` text COMMENT '个人履历（大段文本）',
  `family_relationship` text COMMENT '家庭关系信息（大段文本）',
  `remarks` text COMMENT '备注（大段文本）',
  `photo_url` varchar(500) DEFAULT NULL COMMENT '照片URL',
  `first_org_id` bigint NOT NULL COMMENT '一级机构ID',
  `second_org_id` bigint NOT NULL COMMENT '二级机构ID',
  `third_org_id` bigint NOT NULL COMMENT '三级机构ID',
  `position_id` bigint NOT NULL COMMENT '职位ID',
  `job_title` varchar(20) NOT NULL COMMENT '职称：JUNIOR(初级), INTERMEDIATE(中级), SENIOR(高级)',
  `salary_standard_id` bigint DEFAULT NULL COMMENT '薪酬标准ID',
  `registrar_id` bigint NOT NULL COMMENT '登记人ID',
  `registration_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '登记时间',
  `reviewer_id` bigint DEFAULT NULL COMMENT '复核人ID',
  `review_time` datetime DEFAULT NULL COMMENT '复核时间',
  `review_comments` text COMMENT '复核意见（大段文本）',
  `status` varchar(20) DEFAULT 'PENDING_REVIEW' COMMENT '状态：PENDING_REVIEW(待复核), NORMAL(正常), DELETED(已删除)',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  `delete_reason` varchar(500) DEFAULT NULL COMMENT '删除原因',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`archive_id`),
  UNIQUE KEY `archive_number` (`archive_number`),
  KEY `salary_standard_id` (`salary_standard_id`),
  KEY `registrar_id` (`registrar_id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `idx_archive_number` (`archive_number`),
  KEY `idx_name` (`name`),
  KEY `idx_first_org_id` (`first_org_id`),
  KEY `idx_second_org_id` (`second_org_id`),
  KEY `idx_third_org_id` (`third_org_id`),
  KEY `idx_position_id` (`position_id`),
  KEY `idx_status` (`status`),
  KEY `idx_registration_time` (`registration_time`),
  KEY `idx_org_status` (`first_org_id`,`second_org_id`,`third_org_id`,`status`),
  CONSTRAINT `employee_archive_ibfk_1` FOREIGN KEY (`first_org_id`) REFERENCES `organization` (`org_id`) ON DELETE RESTRICT,
  CONSTRAINT `employee_archive_ibfk_2` FOREIGN KEY (`second_org_id`) REFERENCES `organization` (`org_id`) ON DELETE RESTRICT,
  CONSTRAINT `employee_archive_ibfk_3` FOREIGN KEY (`third_org_id`) REFERENCES `organization` (`org_id`) ON DELETE RESTRICT,
  CONSTRAINT `employee_archive_ibfk_4` FOREIGN KEY (`position_id`) REFERENCES `position` (`position_id`) ON DELETE RESTRICT,
  CONSTRAINT `employee_archive_ibfk_5` FOREIGN KEY (`salary_standard_id`) REFERENCES `salary_standard` (`standard_id`) ON DELETE SET NULL,
  CONSTRAINT `employee_archive_ibfk_6` FOREIGN KEY (`registrar_id`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `employee_archive_ibfk_7` FOREIGN KEY (`reviewer_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `chk_archive_status` CHECK ((`status` in (_utf8mb4'PENDING_REVIEW',_utf8mb4'NORMAL',_utf8mb4'DELETED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='员工档案表';

-- ----------------------------
-- Records of employee_archive
-- ----------------------------
BEGIN;
INSERT INTO `employee_archive` (
  `archive_number`, `name`, `gender`, `id_number`, `birthday`, `age`, `nationality`, 
  `place_of_birth`, `ethnicity`, `religious_belief`, `political_status`, `education_level`, `major`,
  `email`, `phone`, `qq`, `mobile`, `address`, `postal_code`, `hobby`, `personal_resume`, `family_relationship`, `remarks`,
  `first_org_id`, `second_org_id`, `third_org_id`, `position_id`, `job_title`, `salary_standard_id`,
  `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`,
  `create_time`, `update_time`
) VALUES
-- 已复核通过的员工档案
('202501010101', '张三', 'MALE', '110101199001011234', '1990-01-01', 35, '中国', '北京', '汉族', '无', '群众', '本科', '计算机科学与技术',
 'zhangsan@example.com', '010-12345678', '123456789', '13800138001', '北京市朝阳区xxx街道xxx号', '100000', '阅读、编程', '2010-2014 就读于XX大学计算机系...', '父亲：张XX，母亲：李XX', '工作认真负责',
 1, 3, 6, 1, 'INTERMEDIATE', 2, 2, '2025-01-20 09:00:00', 3, '2025-01-21 10:30:00', '档案信息完整，已通过复核', 'NORMAL',
 '2025-01-20 09:00:00', '2025-01-21 10:30:00'),

('202501010201', '李四', 'MALE', '110101199205152345', '1992-05-15', 33, '中国', '上海', '汉族', '无', '团员', '本科', '软件工程',
 'lisi@example.com', '021-87654321', '987654321', '13900139002', '上海市浦东新区xxx路xxx号', '200000', '运动、旅游', '2012-2016 就读于XX大学软件工程系...', '父亲：李XX，母亲：王XX', '技术能力强',
 1, 3, 7, 2, 'INTERMEDIATE', 4, 2, '2025-01-20 09:30:00', 3, '2025-01-21 11:00:00', '档案信息完整，已通过复核', 'NORMAL',
 '2025-01-20 09:30:00', '2025-01-21 11:00:00'),

('202501010301', '王五', 'FEMALE', '110101199308203456', '1993-08-20', 32, '中国', '广州', '汉族', '无', '党员', '硕士', '产品设计',
 'wangwu@example.com', '020-12345678', '111222333', '13700137003', '广州市天河区xxx大道xxx号', '510000', '设计、摄影', '2014-2017 就读于XX大学设计系...', '父亲：王XX，母亲：赵XX', '产品思维好',
 1, 3, 8, 3, 'INTERMEDIATE', 6, 2, '2025-01-20 10:00:00', 3, '2025-01-21 11:30:00', '档案信息完整，已通过复核', 'NORMAL',
 '2025-01-20 10:00:00', '2025-01-21 11:30:00'),

-- 待复核的员工档案
('202501010102', '赵六', 'MALE', '110101199506254567', '1995-06-25', 30, '中国', '深圳', '汉族', '无', '群众', '本科', '计算机科学与技术',
 'zhaoliu@example.com', '0755-12345678', '222333444', '13600136004', '深圳市南山区xxx路xxx号', '518000', '游戏、电影', '2013-2017 就读于XX大学计算机系...', '父亲：赵XX，母亲：钱XX', NULL,
 1, 3, 6, 1, 'JUNIOR', 1, 2, '2025-01-25 14:00:00', NULL, NULL, NULL, 'PENDING_REVIEW',
 '2025-01-25 14:00:00', '2025-01-25 14:00:00'),

('202501010202', '孙七', 'FEMALE', '110101199710305678', '1997-10-30', 28, '中国', '杭州', '汉族', '无', '团员', '本科', '软件工程',
 'sunqi@example.com', '0571-87654321', '333444555', '13500135005', '杭州市西湖区xxx街xxx号', '310000', '音乐、阅读', '2015-2019 就读于XX大学软件工程系...', '父亲：孙XX，母亲：周XX', NULL,
 1, 3, 7, 2, 'JUNIOR', NULL, 2, '2025-01-25 15:00:00', NULL, NULL, NULL, 'PENDING_REVIEW',
 '2025-01-25 15:00:00', '2025-01-25 15:00:00');
COMMIT;

-- ----------------------------
-- Table structure for organization
-- ----------------------------
DROP TABLE IF EXISTS `organization`;
CREATE TABLE `organization` (
  `org_id` bigint NOT NULL AUTO_INCREMENT COMMENT '机构ID',
  `org_code` varchar(2) NOT NULL COMMENT '机构编号（用于生成档案编号）',
  `org_name` varchar(100) NOT NULL COMMENT '机构名称',
  `org_level` tinyint NOT NULL COMMENT '机构级别：1(一级机构), 2(二级机构), 3(三级机构)',
  `parent_id` bigint DEFAULT NULL COMMENT '父机构ID（一级机构的parent_id为NULL）',
  `description` varchar(500) DEFAULT NULL COMMENT '描述',
  `status` varchar(20) DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE(激活), INACTIVE(禁用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`org_id`),
  UNIQUE KEY `uk_org_code_parent` (`parent_id`,`org_code`,`org_level`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_org_level` (`org_level`),
  CONSTRAINT `organization_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `organization` (`org_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_level1_parent` CHECK (((`org_level` <> 1) or (`parent_id` is null))),
  CONSTRAINT `chk_level23_parent` CHECK (((`org_level` = 1) or (`parent_id` is not null))),
  CONSTRAINT `chk_org_level` CHECK ((`org_level` in (1,2,3)))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='机构表';

-- ----------------------------
-- Records of organization
-- ----------------------------
BEGIN;
INSERT INTO `organization` (`org_id`, `org_code`, `org_name`, `org_level`, `parent_id`, `description`, `status`, `create_time`, `update_time`) VALUES (1, '01', '技术中心', 1, NULL, NULL, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `organization` (`org_id`, `org_code`, `org_name`, `org_level`, `parent_id`, `description`, `status`, `create_time`, `update_time`) VALUES (2, '02', '市场中心', 1, NULL, NULL, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `organization` (`org_id`, `org_code`, `org_name`, `org_level`, `parent_id`, `description`, `status`, `create_time`, `update_time`) VALUES (3, '01', '产品研发部', 2, 1, NULL, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `organization` (`org_id`, `org_code`, `org_name`, `org_level`, `parent_id`, `description`, `status`, `create_time`, `update_time`) VALUES (4, '02', '测试部', 2, 1, NULL, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `organization` (`org_id`, `org_code`, `org_name`, `org_level`, `parent_id`, `description`, `status`, `create_time`, `update_time`) VALUES (5, '01', '市场推广部', 2, 2, NULL, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `organization` (`org_id`, `org_code`, `org_name`, `org_level`, `parent_id`, `description`, `status`, `create_time`, `update_time`) VALUES (6, '01', '前端组', 3, 3, NULL, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `organization` (`org_id`, `org_code`, `org_name`, `org_level`, `parent_id`, `description`, `status`, `create_time`, `update_time`) VALUES (7, '02', '后端组', 3, 3, NULL, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `organization` (`org_id`, `org_code`, `org_name`, `org_level`, `parent_id`, `description`, `status`, `create_time`, `update_time`) VALUES (8, '03', '产品组', 3, 3, NULL, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `organization` (`org_id`, `org_code`, `org_name`, `org_level`, `parent_id`, `description`, `status`, `create_time`, `update_time`) VALUES (9, '01', '测试一组', 3, 4, NULL, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
COMMIT;

-- ----------------------------
-- Table structure for position
-- ----------------------------
DROP TABLE IF EXISTS `position`;
CREATE TABLE `position` (
  `position_id` bigint NOT NULL AUTO_INCREMENT COMMENT '职位ID',
  `position_name` varchar(100) NOT NULL COMMENT '职位名称',
  `third_org_id` bigint NOT NULL COMMENT '所属三级机构ID',
  `description` varchar(500) DEFAULT NULL COMMENT '职位描述',
  `status` varchar(20) DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE(激活), INACTIVE(禁用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`position_id`),
  KEY `idx_third_org_id` (`third_org_id`),
  CONSTRAINT `position_ibfk_1` FOREIGN KEY (`third_org_id`) REFERENCES `organization` (`org_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='职位表';

-- ----------------------------
-- Records of position
-- ----------------------------
BEGIN;
INSERT INTO `position` (`position_id`, `position_name`, `third_org_id`, `description`, `status`, `create_time`, `update_time`) VALUES (1, '前端工程师', 6, NULL, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `position` (`position_id`, `position_name`, `third_org_id`, `description`, `status`, `create_time`, `update_time`) VALUES (2, '后端工程师', 7, NULL, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `position` (`position_id`, `position_name`, `third_org_id`, `description`, `status`, `create_time`, `update_time`) VALUES (3, '产品经理', 8, NULL, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `position` (`position_id`, `position_name`, `third_org_id`, `description`, `status`, `create_time`, `update_time`) VALUES (4, '测试工程师', 9, NULL, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
COMMIT;

-- ----------------------------
-- Table structure for salary_issuance
-- ----------------------------
DROP TABLE IF EXISTS `salary_issuance`;
CREATE TABLE `salary_issuance` (
  `issuance_id` bigint NOT NULL AUTO_INCREMENT COMMENT '薪酬发放单ID',
  `salary_slip_number` varchar(50) NOT NULL COMMENT '薪酬单号（如：PAY202307001）',
  `third_org_id` bigint NOT NULL COMMENT '三级机构ID',
  `total_employees` int DEFAULT '0' COMMENT '总人数',
  `total_basic_salary` decimal(12,2) DEFAULT '0.00' COMMENT '基本薪酬总额',
  `total_net_pay` decimal(12,2) DEFAULT '0.00' COMMENT '实发薪酬总额',
  `issuance_month` date NOT NULL COMMENT '发放月份',
  `issuance_time` date DEFAULT NULL COMMENT '实际发放时间（财务系统付款日期）',
  `registrar_id` bigint NOT NULL COMMENT '登记人ID',
  `registration_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '登记时间',
  `reviewer_id` bigint DEFAULT NULL COMMENT '复核人ID',
  `review_time` datetime DEFAULT NULL COMMENT '复核时间',
  `reject_reason` varchar(500) DEFAULT NULL COMMENT '驳回原因',
  `status` varchar(20) DEFAULT 'PENDING_REGISTRATION' COMMENT '状态：PENDING_REGISTRATION(待登记), PENDING_REVIEW(待复核), EXECUTED(执行), PAID(已付款)',
  `payment_status` varchar(20) DEFAULT NULL COMMENT '付款状态（由财务系统更新）：PENDING(待付款), PAID(已付款)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`issuance_id`),
  UNIQUE KEY `salary_slip_number` (`salary_slip_number`),
  KEY `registrar_id` (`registrar_id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `idx_salary_slip_number` (`salary_slip_number`),
  KEY `idx_third_org_id` (`third_org_id`),
  KEY `idx_status` (`status`),
  KEY `idx_issuance_month` (`issuance_month`),
  KEY `idx_issuance_time` (`issuance_time`),
  KEY `idx_org_month_status` (`third_org_id`,`issuance_month`,`status`),
  CONSTRAINT `salary_issuance_ibfk_1` FOREIGN KEY (`third_org_id`) REFERENCES `organization` (`org_id`) ON DELETE RESTRICT,
  CONSTRAINT `salary_issuance_ibfk_2` FOREIGN KEY (`registrar_id`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `salary_issuance_ibfk_3` FOREIGN KEY (`reviewer_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `chk_issuance_status` CHECK ((`status` in (_utf8mb4'PENDING_REGISTRATION',_utf8mb4'PENDING_REVIEW',_utf8mb4'EXECUTED',_utf8mb4'PAID',_utf8mb4'REJECTED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='薪酬发放单表';

-- ----------------------------
-- Records of salary_issuance
-- ----------------------------
BEGIN;
INSERT INTO `salary_issuance` (
  `salary_slip_number`, `third_org_id`, `total_employees`, `total_basic_salary`, `total_net_pay`,
  `issuance_month`, `issuance_time`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `reject_reason`, `status`, `payment_status`,
  `create_time`, `update_time`
) VALUES
-- 已复核通过的发放单
('PAY202501001', 6, 2, 20000.00, 23294.00, '2025-01-01', '2025-01-31', 4, '2025-01-28 10:00:00', 5, '2025-01-29 14:00:00', NULL, 'EXECUTED', 'PAID',
 '2025-01-28 10:00:00', '2025-01-29 14:00:00'),

-- 待复核的发放单
('PAY202501002', 7, 1, 13000.00, 14792.00, '2025-01-01', NULL, 4, '2025-01-28 11:00:00', NULL, NULL, NULL, 'PENDING_REVIEW', NULL,
 '2025-01-28 11:00:00', '2025-01-28 11:00:00');
COMMIT;

-- ----------------------------
-- Table structure for salary_issuance_detail
-- ----------------------------
DROP TABLE IF EXISTS `salary_issuance_detail`;
CREATE TABLE `salary_issuance_detail` (
  `detail_id` bigint NOT NULL AUTO_INCREMENT COMMENT '薪酬发放明细ID',
  `issuance_id` bigint NOT NULL COMMENT '薪酬发放单ID',
  `employee_id` bigint NOT NULL COMMENT '员工档案ID',
  `employee_number` varchar(50) DEFAULT NULL COMMENT '员工编号',
  `employee_name` varchar(50) NOT NULL COMMENT '员工姓名',
  `position_name` varchar(100) DEFAULT NULL COMMENT '职位名称',
  `basic_salary` decimal(10,2) DEFAULT '0.00' COMMENT '基本工资',
  `performance_bonus` decimal(10,2) DEFAULT '0.00' COMMENT '绩效奖金',
  `transportation_allowance` decimal(10,2) DEFAULT '0.00' COMMENT '交通补贴',
  `meal_allowance` decimal(10,2) DEFAULT '0.00' COMMENT '餐费补贴',
  `pension_insurance` decimal(10,2) DEFAULT '0.00' COMMENT '养老保险',
  `medical_insurance` decimal(10,2) DEFAULT '0.00' COMMENT '医疗保险',
  `unemployment_insurance` decimal(10,2) DEFAULT '0.00' COMMENT '失业保险',
  `housing_fund` decimal(10,2) DEFAULT '0.00' COMMENT '住房公积金',
  `award_amount` decimal(10,2) DEFAULT '0.00' COMMENT '奖励金额',
  `deduction_amount` decimal(10,2) DEFAULT '0.00' COMMENT '应扣金额',
  `total_income` decimal(10,2) DEFAULT '0.00' COMMENT '总收入',
  `total_deduction` decimal(10,2) DEFAULT '0.00' COMMENT '总扣除',
  `net_pay` decimal(10,2) DEFAULT '0.00' COMMENT '实发金额',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`detail_id`),
  KEY `idx_issuance_id` (`issuance_id`),
  KEY `idx_employee_id` (`employee_id`),
  CONSTRAINT `salary_issuance_detail_ibfk_1` FOREIGN KEY (`issuance_id`) REFERENCES `salary_issuance` (`issuance_id`) ON DELETE CASCADE,
  CONSTRAINT `salary_issuance_detail_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employee_archive` (`archive_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='薪酬发放明细表';

-- ----------------------------
-- Records of salary_issuance_detail
-- ----------------------------
BEGIN;
-- 为发放单 PAY202501001 添加明细（前端组，2个员工）
INSERT INTO `salary_issuance_detail` (
  `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`,
  `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`,
  `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`,
  `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`,
  `create_time`, `update_time`
) VALUES
-- 张三的薪酬明细（已复核通过）
(1, 1, '202501010101', '张三', '前端工程师',
 12000.00, 3000.00, 500.00, 300.00,
 960.00, 243.00, 60.00, 960.00,
 200.00, 0.00, 16000.00, 2223.00, 13777.00,
 '2025-01-28 10:00:00', '2025-01-28 10:00:00'),

-- 赵六的薪酬明细（待复核）
(1, 4, '202501010102', '赵六', '前端工程师',
 8000.00, 2000.00, 500.00, 300.00,
 640.00, 163.00, 40.00, 640.00,
 200.00, 0.00, 11000.00, 1483.00, 9517.00,
 '2025-01-28 10:00:00', '2025-01-28 10:00:00');

-- 为发放单 PAY202501002 添加明细（后端组，1个员工）
INSERT INTO `salary_issuance_detail` (
  `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`,
  `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`,
  `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`,
  `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`,
  `create_time`, `update_time`
) VALUES
-- 李四的薪酬明细（待复核）
(2, 2, '202501010201', '李四', '后端工程师',
 13000.00, 3500.00, 500.00, 300.00,
 1040.00, 263.00, 65.00, 1040.00,
 200.00, 0.00, 17200.00, 2408.00, 14792.00,
 '2025-01-28 11:00:00', '2025-01-28 11:00:00');
COMMIT;

-- ----------------------------
-- Table structure for salary_item
-- ----------------------------
DROP TABLE IF EXISTS `salary_item`;
CREATE TABLE `salary_item` (
  `item_id` bigint NOT NULL AUTO_INCREMENT COMMENT '薪酬项目ID',
  `item_code` varchar(20) NOT NULL COMMENT '项目编号（如：S001）',
  `item_name` varchar(100) NOT NULL COMMENT '项目名称（如：基本工资、绩效奖金等）',
  `item_type` varchar(20) NOT NULL COMMENT '项目类型：INCOME(收入项), DEDUCTION(扣除项)',
  `calculation_rule` varchar(500) DEFAULT NULL COMMENT '计算规则（如：基本工资*8%），为空表示手动输入',
  `sort_order` int DEFAULT '0' COMMENT '排序顺序',
  `status` varchar(20) DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE(激活), INACTIVE(禁用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `item_code` (`item_code`),
  KEY `idx_item_code` (`item_code`),
  KEY `idx_item_type` (`item_type`),
  CONSTRAINT `chk_item_type` CHECK ((`item_type` in (_utf8mb4'INCOME',_utf8mb4'DEDUCTION')))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='薪酬项目表';

-- ----------------------------
-- Records of salary_item
-- ----------------------------
BEGIN;
INSERT INTO `salary_item` (`item_id`, `item_code`, `item_name`, `item_type`, `calculation_rule`, `sort_order`, `status`, `create_time`, `update_time`) VALUES (1, 'S001', '基本工资', 'INCOME', NULL, 1, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `salary_item` (`item_id`, `item_code`, `item_name`, `item_type`, `calculation_rule`, `sort_order`, `status`, `create_time`, `update_time`) VALUES (2, 'S002', '绩效奖金', 'INCOME', NULL, 2, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `salary_item` (`item_id`, `item_code`, `item_name`, `item_type`, `calculation_rule`, `sort_order`, `status`, `create_time`, `update_time`) VALUES (3, 'S003', '交通补贴', 'INCOME', NULL, 3, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `salary_item` (`item_id`, `item_code`, `item_name`, `item_type`, `calculation_rule`, `sort_order`, `status`, `create_time`, `update_time`) VALUES (4, 'S004', '餐费补贴', 'INCOME', NULL, 4, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `salary_item` (`item_id`, `item_code`, `item_name`, `item_type`, `calculation_rule`, `sort_order`, `status`, `create_time`, `update_time`) VALUES (5, 'S005', '全勤奖', 'INCOME', NULL, 5, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `salary_item` (`item_id`, `item_code`, `item_name`, `item_type`, `calculation_rule`, `sort_order`, `status`, `create_time`, `update_time`) VALUES (6, 'S006', '养老保险', 'DEDUCTION', '基本工资*8%', 6, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `salary_item` (`item_id`, `item_code`, `item_name`, `item_type`, `calculation_rule`, `sort_order`, `status`, `create_time`, `update_time`) VALUES (7, 'S007', '医疗保险', 'DEDUCTION', '基本工资*2%+3', 7, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `salary_item` (`item_id`, `item_code`, `item_name`, `item_type`, `calculation_rule`, `sort_order`, `status`, `create_time`, `update_time`) VALUES (8, 'S008', '失业保险', 'DEDUCTION', '基本工资*0.5%', 8, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `salary_item` (`item_id`, `item_code`, `item_name`, `item_type`, `calculation_rule`, `sort_order`, `status`, `create_time`, `update_time`) VALUES (9, 'S009', '住房公积金', 'DEDUCTION', '基本工资*8%', 9, 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
COMMIT;

-- ----------------------------
-- Table structure for salary_standard
-- ----------------------------
DROP TABLE IF EXISTS `salary_standard`;
CREATE TABLE `salary_standard` (
  `standard_id` bigint NOT NULL AUTO_INCREMENT COMMENT '薪酬标准ID',
  `standard_code` varchar(50) NOT NULL COMMENT '薪酬标准编号（如：SAL202307001）',
  `standard_name` varchar(200) NOT NULL COMMENT '薪酬标准名称（如：前端工程师-中级标准）',
  `position_id` bigint NOT NULL COMMENT '适用职位ID',
  `job_title` varchar(20) NOT NULL COMMENT '职称：JUNIOR(初级), INTERMEDIATE(中级), SENIOR(高级)',
  `formulator_id` bigint DEFAULT NULL COMMENT '制定人ID',
  `registrar_id` bigint NOT NULL COMMENT '登记人ID',
  `registration_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '登记时间',
  `reviewer_id` bigint DEFAULT NULL COMMENT '复核人ID',
  `review_time` datetime DEFAULT NULL COMMENT '复核时间',
  `review_comments` text COMMENT '复核意见（大段文本）',
  `status` varchar(20) DEFAULT 'PENDING_REVIEW' COMMENT '状态：PENDING_REVIEW(待复核), APPROVED(已通过), REJECTED(已驳回)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`standard_id`),
  UNIQUE KEY `standard_code` (`standard_code`),
  KEY `formulator_id` (`formulator_id`),
  KEY `registrar_id` (`registrar_id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `idx_standard_code` (`standard_code`),
  KEY `idx_position_id` (`position_id`),
  KEY `idx_status` (`status`),
  KEY `idx_position_job_title` (`position_id`,`job_title`,`status`),
  CONSTRAINT `salary_standard_ibfk_1` FOREIGN KEY (`position_id`) REFERENCES `position` (`position_id`) ON DELETE RESTRICT,
  CONSTRAINT `salary_standard_ibfk_2` FOREIGN KEY (`formulator_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `salary_standard_ibfk_3` FOREIGN KEY (`registrar_id`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `salary_standard_ibfk_4` FOREIGN KEY (`reviewer_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `chk_standard_status` CHECK ((`status` in (_utf8mb4'PENDING_REVIEW',_utf8mb4'APPROVED',_utf8mb4'REJECTED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='薪酬标准表';

-- ----------------------------
-- Records of salary_standard
-- ----------------------------
BEGIN;
-- 为前端工程师职位创建不同职称的薪酬标准
INSERT INTO `salary_standard` (`standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES
('SAL202501001', '前端工程师-初级标准', 1, 'JUNIOR', NULL, 4, '2025-01-15 10:00:00', 5, '2025-01-16 14:30:00', '标准合理，已通过', 'APPROVED', '2025-01-15 10:00:00', '2025-01-16 14:30:00'),
('SAL202501002', '前端工程师-中级标准', 1, 'INTERMEDIATE', NULL, 4, '2025-01-15 10:00:00', 5, '2025-01-16 14:30:00', '标准合理，已通过', 'APPROVED', '2025-01-15 10:00:00', '2025-01-16 14:30:00'),
('SAL202501003', '前端工程师-高级标准', 1, 'SENIOR', NULL, 4, '2025-01-15 10:00:00', NULL, NULL, NULL, 'PENDING_REVIEW', '2025-01-15 10:00:00', '2025-01-15 10:00:00');

-- 为后端工程师职位创建薪酬标准
INSERT INTO `salary_standard` (`standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES
('SAL202501004', '后端工程师-中级标准', 2, 'INTERMEDIATE', NULL, 4, '2025-01-15 10:00:00', 5, '2025-01-16 14:30:00', '标准合理，已通过', 'APPROVED', '2025-01-15 10:00:00', '2025-01-16 14:30:00'),
('SAL202501005', '后端工程师-高级标准', 2, 'SENIOR', NULL, 4, '2025-01-15 10:00:00', 5, '2025-01-16 14:30:00', '标准合理，已通过', 'APPROVED', '2025-01-15 10:00:00', '2025-01-16 14:30:00');

-- 为产品经理职位创建薪酬标准
INSERT INTO `salary_standard` (`standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES
('SAL202501006', '产品经理-中级标准', 3, 'INTERMEDIATE', NULL, 4, '2025-01-15 10:00:00', 5, '2025-01-16 14:30:00', '标准合理，已通过', 'APPROVED', '2025-01-15 10:00:00', '2025-01-16 14:30:00');
COMMIT;

-- ----------------------------
-- Table structure for salary_standard_item
-- ----------------------------
DROP TABLE IF EXISTS `salary_standard_item`;
CREATE TABLE `salary_standard_item` (
  `standard_item_id` bigint NOT NULL AUTO_INCREMENT COMMENT '薪酬标准明细ID',
  `standard_id` bigint NOT NULL COMMENT '薪酬标准ID',
  `item_id` bigint NOT NULL COMMENT '薪酬项目ID',
  `amount` decimal(10,2) DEFAULT '0.00' COMMENT '金额（保留两位小数）',
  `is_calculated` tinyint(1) DEFAULT '0' COMMENT '是否根据计算规则计算：0(手动输入), 1(自动计算)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`standard_item_id`),
  UNIQUE KEY `uk_standard_item` (`standard_id`,`item_id`),
  KEY `idx_standard_id` (`standard_id`),
  KEY `idx_item_id` (`item_id`),
  CONSTRAINT `salary_standard_item_ibfk_1` FOREIGN KEY (`standard_id`) REFERENCES `salary_standard` (`standard_id`) ON DELETE CASCADE,
  CONSTRAINT `salary_standard_item_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `salary_item` (`item_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='薪酬标准明细表';

-- ----------------------------
-- Records of salary_standard_item
-- ----------------------------
BEGIN;
-- 前端工程师-初级标准 (standard_id=1)
INSERT INTO `salary_standard_item` (`standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES
(1, 1, 8000.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 基本工资
(1, 2, 2000.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 绩效奖金
(1, 3, 500.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),   -- 交通补贴
(1, 4, 300.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),   -- 餐费补贴
(1, 5, 200.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),   -- 全勤奖
(1, 6, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),     -- 养老保险（自动计算）
(1, 7, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),     -- 医疗保险（自动计算）
(1, 8, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),     -- 失业保险（自动计算）
(1, 9, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00');      -- 住房公积金（自动计算）

-- 前端工程师-中级标准 (standard_id=2)
INSERT INTO `salary_standard_item` (`standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES
(2, 1, 12000.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'), -- 基本工资
(2, 2, 3000.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'), -- 绩效奖金
(2, 3, 500.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 交通补贴
(2, 4, 300.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 餐费补贴
(2, 5, 200.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 全勤奖
(2, 6, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 养老保险（自动计算）
(2, 7, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 医疗保险（自动计算）
(2, 8, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 失业保险（自动计算）
(2, 9, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00');     -- 住房公积金（自动计算）

-- 前端工程师-高级标准 (standard_id=3)
INSERT INTO `salary_standard_item` (`standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES
(3, 1, 18000.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'), -- 基本工资
(3, 2, 5000.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'), -- 绩效奖金
(3, 3, 800.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 交通补贴
(3, 4, 500.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 餐费补贴
(3, 5, 300.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 全勤奖
(3, 6, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 养老保险（自动计算）
(3, 7, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 医疗保险（自动计算）
(3, 8, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 失业保险（自动计算）
(3, 9, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00');     -- 住房公积金（自动计算）

-- 后端工程师-中级标准 (standard_id=4)
INSERT INTO `salary_standard_item` (`standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES
(4, 1, 13000.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'), -- 基本工资
(4, 2, 3500.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'), -- 绩效奖金
(4, 3, 500.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 交通补贴
(4, 4, 300.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 餐费补贴
(4, 5, 200.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 全勤奖
(4, 6, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 养老保险（自动计算）
(4, 7, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 医疗保险（自动计算）
(4, 8, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 失业保险（自动计算）
(4, 9, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00');     -- 住房公积金（自动计算）

-- 后端工程师-高级标准 (standard_id=5)
INSERT INTO `salary_standard_item` (`standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES
(5, 1, 20000.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'), -- 基本工资
(5, 2, 6000.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'), -- 绩效奖金
(5, 3, 800.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 交通补贴
(5, 4, 500.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 餐费补贴
(5, 5, 300.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 全勤奖
(5, 6, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 养老保险（自动计算）
(5, 7, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 医疗保险（自动计算）
(5, 8, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 失业保险（自动计算）
(5, 9, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00');     -- 住房公积金（自动计算）

-- 产品经理-中级标准 (standard_id=6)
INSERT INTO `salary_standard_item` (`standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES
(6, 1, 15000.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'), -- 基本工资
(6, 2, 4000.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'), -- 绩效奖金
(6, 3, 600.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 交通补贴
(6, 4, 400.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 餐费补贴
(6, 5, 300.00, 0, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),  -- 全勤奖
(6, 6, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 养老保险（自动计算）
(6, 7, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 医疗保险（自动计算）
(6, 8, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),    -- 失业保险（自动计算）
(6, 9, 0.00, 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00');     -- 住房公积金（自动计算）
COMMIT;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user_id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `real_name` varchar(50) NOT NULL COMMENT '真实姓名',
  `role` varchar(20) NOT NULL COMMENT '角色：HR_SPECIALIST(人事专员), HR_MANAGER(人事经理), SALARY_SPECIALIST(薪酬专员), SALARY_MANAGER(薪酬经理)',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '电话',
  `status` varchar(20) DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE(激活), INACTIVE(禁用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  CONSTRAINT `chk_user_role` CHECK ((`role` in (_utf8mb4'HR_SPECIALIST',_utf8mb4'HR_MANAGER',_utf8mb4'SALARY_SPECIALIST',_utf8mb4'SALARY_MANAGER'))),
  CONSTRAINT `chk_user_status` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE')))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';

-- ----------------------------
-- Records of user
-- ----------------------------
BEGIN;
INSERT INTO `user` (`user_id`, `username`, `password`, `real_name`, `role`, `email`, `phone`, `status`, `create_time`, `update_time`) VALUES (1, 'admin', '$2a$10$OjBAzQZ5FxSaRAW2JnBGJetniIf.AMMRCa0lRYaI9BWtha.P5xnWi', '系统管理员', 'HR_MANAGER', 'admin@example.com', '13800138000', 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `user` (`user_id`, `username`, `password`, `real_name`, `role`, `email`, `phone`, `status`, `create_time`, `update_time`) VALUES (2, 'hr01', '$2a$10$OjBAzQZ5FxSaRAW2JnBGJetniIf.AMMRCa0lRYaI9BWtha.P5xnWi', '王管理员', 'HR_SPECIALIST', 'hr01@example.com', '13800138001', 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `user` (`user_id`, `username`, `password`, `real_name`, `role`, `email`, `phone`, `status`, `create_time`, `update_time`) VALUES (3, 'hr02', '$2a$10$OjBAzQZ5FxSaRAW2JnBGJetniIf.AMMRCa0lRYaI9BWtha.P5xnWi', '李管理员', 'HR_MANAGER', 'hr02@example.com', '13800138002', 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `user` (`user_id`, `username`, `password`, `real_name`, `role`, `email`, `phone`, `status`, `create_time`, `update_time`) VALUES (4, 'salary01', '$2a$10$OjBAzQZ5FxSaRAW2JnBGJetniIf.AMMRCa0lRYaI9BWtha.P5xnWi', '张经理', 'SALARY_SPECIALIST', 'salary01@example.com', '13800138003', 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `user` (`user_id`, `username`, `password`, `real_name`, `role`, `email`, `phone`, `status`, `create_time`, `update_time`) VALUES (5, 'salary02', '$2a$10$OjBAzQZ5FxSaRAW2JnBGJetniIf.AMMRCa0lRYaI9BWtha.P5xnWi', '李经理', 'SALARY_MANAGER', 'salary02@example.com', '13800138004', 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
COMMIT;

-- ----------------------------
-- View structure for v_employee_archive_full
-- ----------------------------
DROP VIEW IF EXISTS `v_employee_archive_full`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_employee_archive_full` AS select `ea`.`archive_id` AS `archive_id`,`ea`.`archive_number` AS `archive_number`,`ea`.`name` AS `name`,`ea`.`gender` AS `gender`,`ea`.`id_number` AS `id_number`,`ea`.`birthday` AS `birthday`,`ea`.`age` AS `age`,`ea`.`nationality` AS `nationality`,`ea`.`place_of_birth` AS `place_of_birth`,`ea`.`ethnicity` AS `ethnicity`,`ea`.`religious_belief` AS `religious_belief`,`ea`.`political_status` AS `political_status`,`ea`.`education_level` AS `education_level`,`ea`.`major` AS `major`,`ea`.`email` AS `email`,`ea`.`phone` AS `phone`,`ea`.`qq` AS `qq`,`ea`.`mobile` AS `mobile`,`ea`.`address` AS `address`,`ea`.`postal_code` AS `postal_code`,`ea`.`hobby` AS `hobby`,`ea`.`personal_resume` AS `personal_resume`,`ea`.`family_relationship` AS `family_relationship`,`ea`.`remarks` AS `remarks`,`ea`.`photo_url` AS `photo_url`,`ea`.`first_org_id` AS `first_org_id`,`ea`.`second_org_id` AS `second_org_id`,`ea`.`third_org_id` AS `third_org_id`,`ea`.`position_id` AS `position_id`,`ea`.`job_title` AS `job_title`,`ea`.`salary_standard_id` AS `salary_standard_id`,`ea`.`registrar_id` AS `registrar_id`,`ea`.`registration_time` AS `registration_time`,`ea`.`reviewer_id` AS `reviewer_id`,`ea`.`review_time` AS `review_time`,`ea`.`status` AS `status`,`ea`.`delete_time` AS `delete_time`,`ea`.`delete_reason` AS `delete_reason`,`ea`.`create_time` AS `create_time`,`ea`.`update_time` AS `update_time`,`o1`.`org_name` AS `first_org_name`,`o2`.`org_name` AS `second_org_name`,`o3`.`org_name` AS `third_org_name`,`p`.`position_name` AS `position_name`,`u1`.`real_name` AS `registrar_name`,`u2`.`real_name` AS `reviewer_name`,concat(`o1`.`org_name`,'/',`o2`.`org_name`,'/',`o3`.`org_name`) AS `org_full_path` from ((((((`employee_archive` `ea` left join `organization` `o1` on((`ea`.`first_org_id` = `o1`.`org_id`))) left join `organization` `o2` on((`ea`.`second_org_id` = `o2`.`org_id`))) left join `organization` `o3` on((`ea`.`third_org_id` = `o3`.`org_id`))) left join `position` `p` on((`ea`.`position_id` = `p`.`position_id`))) left join `user` `u1` on((`ea`.`registrar_id` = `u1`.`user_id`))) left join `user` `u2` on((`ea`.`reviewer_id` = `u2`.`user_id`)));

-- ----------------------------
-- View structure for v_organization_hierarchy
-- ----------------------------
DROP VIEW IF EXISTS `v_organization_hierarchy`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_organization_hierarchy` AS select `o3`.`org_id` AS `third_org_id`,`o3`.`org_name` AS `third_org_name`,`o2`.`org_id` AS `second_org_id`,`o2`.`org_name` AS `second_org_name`,`o1`.`org_id` AS `first_org_id`,`o1`.`org_name` AS `first_org_name`,concat(`o1`.`org_name`,'/',`o2`.`org_name`,'/',`o3`.`org_name`) AS `full_path` from ((`organization` `o3` left join `organization` `o2` on((`o3`.`parent_id` = `o2`.`org_id`))) left join `organization` `o1` on((`o2`.`parent_id` = `o1`.`org_id`))) where (`o3`.`org_level` = 3);

-- ----------------------------
-- Procedure structure for sp_generate_archive_number
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_generate_archive_number`;
delimiter ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_generate_archive_number`(
    IN p_first_org_id BIGINT,
    IN p_second_org_id BIGINT,
    IN p_third_org_id BIGINT,
    OUT p_archive_number VARCHAR(18)
)
BEGIN
    DECLARE v_year VARCHAR(4);
    DECLARE v_first_code VARCHAR(2);
    DECLARE v_second_code VARCHAR(2);
    DECLARE v_third_code VARCHAR(2);
    DECLARE v_sequence INT;
    
    -- 获取年份
    SET v_year = YEAR(CURDATE());
    
    -- 获取机构编号
    SELECT org_code INTO v_first_code FROM organization WHERE org_id = p_first_org_id;
    SELECT org_code INTO v_second_code FROM organization WHERE org_id = p_second_org_id;
    SELECT org_code INTO v_third_code FROM organization WHERE org_id = p_third_org_id;
    
    -- 获取当前序列号（同机构下当天的最大序号+1）
    SELECT COALESCE(MAX(CAST(SUBSTRING(archive_number, 11, 2) AS UNSIGNED)), 0) + 1
    INTO v_sequence
    FROM employee_archive
    WHERE first_org_id = p_first_org_id
      AND second_org_id = p_second_org_id
      AND third_org_id = p_third_org_id
      AND DATE(create_time) = CURDATE();
    
    -- 生成档案编号：年份4位+一级机构2位+二级机构2位+三级机构2位+序号2位
    SET p_archive_number = CONCAT(
        v_year,
        LPAD(v_first_code, 2, '0'),
        LPAD(v_second_code, 2, '0'),
        LPAD(v_third_code, 2, '0'),
        LPAD(v_sequence, 2, '0')
    );
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
