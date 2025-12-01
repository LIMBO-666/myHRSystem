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
INSERT INTO `employee_archive` (`archive_id`, `archive_number`, `name`, `gender`, `id_number`, `birthday`, `age`, `nationality`, `place_of_birth`, `ethnicity`, `religious_belief`, `political_status`, `education_level`, `major`, `email`, `phone`, `qq`, `mobile`, `address`, `postal_code`, `hobby`, `personal_resume`, `family_relationship`, `remarks`, `photo_url`, `first_org_id`, `second_org_id`, `third_org_id`, `position_id`, `job_title`, `salary_standard_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `delete_time`, `delete_reason`, `create_time`, `update_time`) VALUES (1, '202501010101', '张三', 'MALE', '110101199001011234', '1990-01-01', 35, '中国', '北京市东城区', '汉族', '无', '中共党员', '本科', '计算机科学与技术', 'zhangsan@example.com', '010-12345678', '123456789', '13800138010', '北京市朝阳区建国路88号', '100000', '阅读、编程、篮球', '2012年毕业于北京理工大学计算机科学与技术专业，毕业后进入某互联网公司担任前端开发工程师，2015年加入现公司，负责前端架构设计和团队管理。', '父亲：张某某，母亲：李某某，配偶：王某某，子女：张小明', '工作认真负责，技术能力强，团队协作能力好。', 'https://example.com/photos/zhangsan.jpg', 1, 3, 6, 1, 'SENIOR', 1, 2, '2025-01-15 09:00:00', 3, '2025-01-16 10:30:00', '档案信息完整，审核通过。', 'NORMAL', NULL, NULL, '2025-01-15 09:00:00', '2025-01-16 10:30:00');
INSERT INTO `employee_archive` (`archive_id`, `archive_number`, `name`, `gender`, `id_number`, `birthday`, `age`, `nationality`, `place_of_birth`, `ethnicity`, `religious_belief`, `political_status`, `education_level`, `major`, `email`, `phone`, `qq`, `mobile`, `address`, `postal_code`, `hobby`, `personal_resume`, `family_relationship`, `remarks`, `photo_url`, `first_org_id`, `second_org_id`, `third_org_id`, `position_id`, `job_title`, `salary_standard_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `delete_time`, `delete_reason`, `create_time`, `update_time`) VALUES (2, '202501010102', '李四', 'MALE', '110101199205152345', '1992-05-15', 33, '中国', '北京市西城区', '汉族', '无', '群众', '本科', '软件工程', 'lisi@example.com', '010-23456789', '234567890', '13800138011', '北京市海淀区中关村大街1号', '100080', '音乐、电影、旅游', '2014年毕业于北京邮电大学软件工程专业，毕业后一直从事后端开发工作，2018年加入现公司，负责核心业务系统开发。', '父亲：李某某，母亲：赵某某，未婚', '技术扎实，学习能力强，能够独立完成复杂项目开发。', 'https://example.com/photos/lisi.jpg', 1, 3, 7, 2, 'INTERMEDIATE', 2, 2, '2025-01-16 09:00:00', 3, '2025-01-17 11:00:00', '信息核实无误，同意通过。', 'NORMAL', NULL, NULL, '2025-01-16 09:00:00', '2025-01-17 11:00:00');
INSERT INTO `employee_archive` (`archive_id`, `archive_number`, `name`, `gender`, `id_number`, `birthday`, `age`, `nationality`, `place_of_birth`, `ethnicity`, `religious_belief`, `political_status`, `education_level`, `major`, `email`, `phone`, `qq`, `mobile`, `address`, `postal_code`, `hobby`, `personal_resume`, `family_relationship`, `remarks`, `photo_url`, `first_org_id`, `second_org_id`, `third_org_id`, `position_id`, `job_title`, `salary_standard_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `delete_time`, `delete_reason`, `create_time`, `update_time`) VALUES (3, '202501010201', '王五', 'FEMALE', '110101199308203456', '1993-08-20', 32, '中国', '北京市海淀区', '汉族', '无', '共青团员', '硕士', '产品设计', 'wangwu@example.com', '010-34567890', '345678901', '13800138012', '北京市丰台区南三环西路50号', '100070', '绘画、摄影、瑜伽', '2016年毕业于清华大学设计学专业，获得硕士学位。毕业后从事产品设计工作，2020年加入现公司，负责产品规划和用户体验设计。', '父亲：王某某，母亲：孙某某，配偶：陈某某', '设计思维敏锐，用户体验意识强，产品规划能力突出。', 'https://example.com/photos/wangwu.jpg', 1, 3, 8, 3, 'INTERMEDIATE', 3, 2, '2025-01-17 09:00:00', 3, '2025-01-18 14:00:00', '档案齐全，审核通过。', 'NORMAL', NULL, NULL, '2025-01-17 09:00:00', '2025-01-18 14:00:00');
INSERT INTO `employee_archive` (`archive_id`, `archive_number`, `name`, `gender`, `id_number`, `birthday`, `age`, `nationality`, `place_of_birth`, `ethnicity`, `religious_belief`, `political_status`, `education_level`, `major`, `email`, `phone`, `qq`, `mobile`, `address`, `postal_code`, `hobby`, `personal_resume`, `family_relationship`, `remarks`, `photo_url`, `first_org_id`, `second_org_id`, `third_org_id`, `position_id`, `job_title`, `salary_standard_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `delete_time`, `delete_reason`, `create_time`, `update_time`) VALUES (4, '202501020101', '赵六', 'MALE', '110101199406254567', '1994-06-25', 31, '中国', '北京市通州区', '汉族', '无', '群众', '本科', '计算机科学与技术', 'zhaoliu@example.com', '010-45678901', '456789012', '13800138013', '北京市通州区新华西街58号', '101100', '游戏、运动、阅读', '2016年毕业于北京工业大学计算机科学与技术专业，毕业后从事测试工作，2019年加入现公司，负责自动化测试和测试框架搭建。', '父亲：赵某某，母亲：周某某，未婚', '测试经验丰富，自动化测试能力强，工作细致认真。', 'https://example.com/photos/zhaoliu.jpg', 1, 4, 9, 4, 'JUNIOR', 4, 2, '2025-01-18 09:00:00', NULL, NULL, NULL, 'PENDING_REVIEW', NULL, NULL, '2025-01-18 09:00:00', '2025-01-18 09:00:00');
INSERT INTO `employee_archive` (`archive_id`, `archive_number`, `name`, `gender`, `id_number`, `birthday`, `age`, `nationality`, `place_of_birth`, `ethnicity`, `religious_belief`, `political_status`, `education_level`, `major`, `email`, `phone`, `qq`, `mobile`, `address`, `postal_code`, `hobby`, `personal_resume`, `family_relationship`, `remarks`, `photo_url`, `first_org_id`, `second_org_id`, `third_org_id`, `position_id`, `job_title`, `salary_standard_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `delete_time`, `delete_reason`, `create_time`, `update_time`) VALUES (5, '202501010103', '孙七', 'FEMALE', '110101199507305678', '1995-07-30', 30, '中国', '北京市昌平区', '汉族', '无', '群众', '本科', '信息管理与信息系统', 'sunqi@example.com', '010-56789012', '567890123', '13800138014', '北京市昌平区回龙观东大街88号', '102200', '阅读、写作、烹饪', '2017年毕业于北京信息科技大学信息管理与信息系统专业，毕业后从事前端开发工作，2021年加入现公司，负责移动端前端开发。', '父亲：孙某某，母亲：吴某某，未婚', '前端技术全面，移动端开发经验丰富，工作积极主动。', 'https://example.com/photos/sunqi.jpg', 1, 3, 6, 1, 'JUNIOR', 5, 2, '2025-01-19 09:00:00', 3, '2025-01-20 10:00:00', '信息完整，审核通过。', 'NORMAL', NULL, NULL, '2025-01-19 09:00:00', '2025-01-20 10:00:00');
INSERT INTO `employee_archive` (`archive_id`, `archive_number`, `name`, `gender`, `id_number`, `birthday`, `age`, `nationality`, `place_of_birth`, `ethnicity`, `religious_belief`, `political_status`, `education_level`, `major`, `email`, `phone`, `qq`, `mobile`, `address`, `postal_code`, `hobby`, `personal_resume`, `family_relationship`, `remarks`, `photo_url`, `first_org_id`, `second_org_id`, `third_org_id`, `position_id`, `job_title`, `salary_standard_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `delete_time`, `delete_reason`, `create_time`, `update_time`) VALUES (6, '202501010202', '周八', 'MALE', '110101199609156789', '1996-09-15', 29, '中国', '北京市房山区', '汉族', '无', '共青团员', '本科', '软件工程', 'zhouba@example.com', '010-67890123', '678901234', '13800138015', '北京市房山区良乡大学城', '102400', '篮球、游泳、编程', '2018年毕业于北京理工大学软件工程专业，毕业后从事后端开发工作，2022年加入现公司，负责微服务架构开发。', '父亲：周某某，母亲：郑某某，未婚', '技术能力强，对新技术敏感，学习能力突出。', 'https://example.com/photos/zhouba.jpg', 1, 3, 7, 2, 'JUNIOR', 6, 2, '2025-01-20 09:00:00', NULL, NULL, NULL, 'PENDING_REVIEW', NULL, NULL, '2025-01-20 09:00:00', '2025-01-20 09:00:00');
INSERT INTO `employee_archive` (`archive_id`, `archive_number`, `name`, `gender`, `id_number`, `birthday`, `age`, `nationality`, `place_of_birth`, `ethnicity`, `religious_belief`, `political_status`, `education_level`, `major`, `email`, `phone`, `qq`, `mobile`, `address`, `postal_code`, `hobby`, `personal_resume`, `family_relationship`, `remarks`, `photo_url`, `first_org_id`, `second_org_id`, `third_org_id`, `position_id`, `job_title`, `salary_standard_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `delete_time`, `delete_reason`, `create_time`, `update_time`) VALUES (7, '202501010301', '吴九', 'FEMALE', '110101199710207890', '1997-10-20', 28, '中国', '北京市大兴区', '汉族', '无', '群众', '本科', '产品设计', 'wujiu@example.com', '010-78901234', '789012345', '13800138016', '北京市大兴区亦庄经济技术开发区', '100176', '设计、旅行、摄影', '2019年毕业于北京服装学院产品设计专业，毕业后从事产品设计工作，2023年加入现公司，负责新产品设计。', '父亲：吴某某，母亲：王某某，未婚', '设计理念新颖，创新能力强，团队协作良好。', 'https://example.com/photos/wujiu.jpg', 1, 3, 8, 3, 'JUNIOR', 7, 2, '2025-01-21 09:00:00', 3, '2025-01-22 15:00:00', '审核通过。', 'NORMAL', NULL, NULL, '2025-01-21 09:00:00', '2025-01-22 15:00:00');
INSERT INTO `employee_archive` (`archive_id`, `archive_number`, `name`, `gender`, `id_number`, `birthday`, `age`, `nationality`, `place_of_birth`, `ethnicity`, `religious_belief`, `political_status`, `education_level`, `major`, `email`, `phone`, `qq`, `mobile`, `address`, `postal_code`, `hobby`, `personal_resume`, `family_relationship`, `remarks`, `photo_url`, `first_org_id`, `second_org_id`, `third_org_id`, `position_id`, `job_title`, `salary_standard_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `delete_time`, `delete_reason`, `create_time`, `update_time`) VALUES (8, '202501020102', '郑十', 'MALE', '110101199811258901', '1998-11-25', 27, '中国', '北京市顺义区', '汉族', '无', '群众', '专科', '软件技术', 'zhengshi@example.com', '010-89012345', '890123456', '13800138017', '北京市顺义区天竺镇', '101312', '游戏、音乐、运动', '2020年毕业于北京电子科技职业学院软件技术专业，毕业后从事测试工作，2024年加入现公司，负责功能测试。', '父亲：郑某某，母亲：冯某某，未婚', '工作认真，测试细致，能够发现潜在问题。', 'https://example.com/photos/zhengshi.jpg', 1, 4, 9, 4, 'JUNIOR', 8, 2, '2025-01-22 09:00:00', NULL, NULL, NULL, 'PENDING_REVIEW', NULL, NULL, '2025-01-22 09:00:00', '2025-01-22 09:00:00');
INSERT INTO `employee_archive` (`archive_id`, `archive_number`, `name`, `gender`, `id_number`, `birthday`, `age`, `nationality`, `place_of_birth`, `ethnicity`, `religious_belief`, `political_status`, `education_level`, `major`, `email`, `phone`, `qq`, `mobile`, `address`, `postal_code`, `hobby`, `personal_resume`, `family_relationship`, `remarks`, `photo_url`, `first_org_id`, `second_org_id`, `third_org_id`, `position_id`, `job_title`, `salary_standard_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `delete_time`, `delete_reason`, `create_time`, `update_time`) VALUES (9, '202502010101', '陈十一', 'MALE', '110101198912310123', '1989-12-31', 36, '中国', '上海市黄浦区', '汉族', '无', '中共党员', '硕士', '计算机应用技术', 'chenshiyi@example.com', '021-12345678', '901234567', '13900139010', '上海市浦东新区陆家嘴环路1000号', '200120', '阅读、编程、跑步', '2011年毕业于上海交通大学计算机应用技术专业，获得硕士学位。毕业后一直从事后端开发工作，2016年加入现公司，担任技术专家。', '父亲：陈某某，母亲：褚某某，配偶：卫某某，子女：陈小一', '技术专家，架构设计能力强，团队管理经验丰富。', 'https://example.com/photos/chenshiyi.jpg', 2, 5, 6, 1, 'SENIOR', 9, 2, '2025-01-23 09:00:00', 3, '2025-01-24 10:00:00', '信息完整，审核通过。', 'NORMAL', NULL, NULL, '2025-01-23 09:00:00', '2025-01-24 10:00:00');
INSERT INTO `employee_archive` (`archive_id`, `archive_number`, `name`, `gender`, `id_number`, `birthday`, `age`, `nationality`, `place_of_birth`, `ethnicity`, `religious_belief`, `political_status`, `education_level`, `major`, `email`, `phone`, `qq`, `mobile`, `address`, `postal_code`, `hobby`, `personal_resume`, `family_relationship`, `remarks`, `photo_url`, `first_org_id`, `second_org_id`, `third_org_id`, `position_id`, `job_title`, `salary_standard_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `delete_time`, `delete_reason`, `create_time`, `update_time`) VALUES (10, '202501010104', '冯十二', 'FEMALE', '110101199003120234', '1990-03-12', 35, '中国', '北京市石景山区', '汉族', '无', '群众', '本科', '计算机科学与技术', 'fengshier@example.com', '010-90123456', '012345678', '13800138018', '北京市石景山区石景山路18号', '100043', '瑜伽、阅读、旅行', '2012年毕业于北京科技大学计算机科学与技术专业，毕业后从事前端开发工作，2017年加入现公司，负责前端团队管理。', '父亲：冯某某，母亲：蒋某某，配偶：沈某某', '前端技术全面，团队管理能力强，工作责任心强。', 'https://example.com/photos/fengshier.jpg', 1, 3, 6, 1, 'INTERMEDIATE', 10, 2, '2025-01-24 09:00:00', 3, '2025-01-25 11:00:00', '审核通过。', 'NORMAL', NULL, NULL, '2025-01-24 09:00:00', '2025-01-25 11:00:00');
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
INSERT INTO `salary_issuance` (`issuance_id`, `salary_slip_number`, `third_org_id`, `total_employees`, `total_basic_salary`, `total_net_pay`, `issuance_month`, `issuance_time`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `reject_reason`, `status`, `payment_status`, `create_time`, `update_time`) VALUES (1, 'PAY202501001', 6, 3, 62000.00, 101628.00, '2025-01-01', '2025-01-28', 4, '2025-01-25 09:00:00', 5, '2025-01-26 10:00:00', NULL, 'PAID', 'PAID', '2025-01-25 09:00:00', '2025-01-28 10:00:00');
INSERT INTO `salary_issuance` (`issuance_id`, `salary_slip_number`, `third_org_id`, `total_employees`, `total_basic_salary`, `total_net_pay`, `issuance_month`, `issuance_time`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `reject_reason`, `status`, `payment_status`, `create_time`, `update_time`) VALUES (2, 'PAY202501002', 7, 2, 32000.00, 52326.00, '2025-01-01', '2025-01-28', 4, '2025-01-25 10:00:00', 5, '2025-01-26 11:00:00', NULL, 'PAID', 'PAID', '2025-01-25 10:00:00', '2025-01-28 11:00:00');
INSERT INTO `salary_issuance` (`issuance_id`, `salary_slip_number`, `third_org_id`, `total_employees`, `total_basic_salary`, `total_net_pay`, `issuance_month`, `issuance_time`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `reject_reason`, `status`, `payment_status`, `create_time`, `update_time`) VALUES (3, 'PAY202501003', 8, 2, 35000.00, 57706.00, '2025-01-01', NULL, 4, '2025-01-25 11:00:00', 5, '2025-01-26 12:00:00', NULL, 'EXECUTED', 'PENDING', '2025-01-25 11:00:00', '2025-01-26 12:00:00');
INSERT INTO `salary_issuance` (`issuance_id`, `salary_slip_number`, `third_org_id`, `total_employees`, `total_basic_salary`, `total_net_pay`, `issuance_month`, `issuance_time`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `reject_reason`, `status`, `payment_status`, `create_time`, `update_time`) VALUES (4, 'PAY202501004', 9, 2, 23000.00, 37548.00, '2025-01-01', NULL, 4, '2025-01-25 12:00:00', NULL, NULL, NULL, 'PENDING_REVIEW', NULL, '2025-01-25 12:00:00', '2025-01-25 12:00:00');
INSERT INTO `salary_issuance` (`issuance_id`, `salary_slip_number`, `third_org_id`, `total_employees`, `total_basic_salary`, `total_net_pay`, `issuance_month`, `issuance_time`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `reject_reason`, `status`, `payment_status`, `create_time`, `update_time`) VALUES (5, 'PAY202502001', 6, 3, 62000.00, 101628.00, '2025-02-01', NULL, 4, '2025-02-25 09:00:00', NULL, NULL, NULL, 'PENDING_REGISTRATION', NULL, '2025-02-25 09:00:00', '2025-02-25 09:00:00');
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
-- 发放单1：前端组2025年1月（3人）
INSERT INTO `salary_issuance_detail` (`detail_id`, `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`, `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`, `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`, `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`, `create_time`, `update_time`) VALUES (1, 1, 1, '202501010101', '张三', '前端工程师', 25000.00, 8000.00, 1000.00, 800.00, 2000.00, 503.00, 125.00, 2000.00, 500.00, 0.00, 35300.00, 4628.00, 30672.00, '2025-01-25 09:00:00', '2025-01-25 09:00:00');
INSERT INTO `salary_issuance_detail` (`detail_id`, `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`, `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`, `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`, `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`, `create_time`, `update_time`) VALUES (2, 1, 5, '202501010103', '孙七', '前端工程师', 13000.00, 3500.00, 600.00, 500.00, 1040.00, 263.00, 65.00, 1040.00, 250.00, 0.00, 17850.00, 2408.00, 15442.00, '2025-01-25 09:00:00', '2025-01-25 09:00:00');
INSERT INTO `salary_issuance_detail` (`detail_id`, `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`, `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`, `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`, `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`, `create_time`, `update_time`) VALUES (3, 1, 10, '202501010104', '冯十二', '前端工程师', 16000.00, 4500.00, 700.00, 550.00, 1280.00, 323.00, 80.00, 1280.00, 300.00, 0.00, 22050.00, 2963.00, 19087.00, '2025-01-25 09:00:00', '2025-01-25 09:00:00');
-- 发放单2：后端组2025年1月（2人）
INSERT INTO `salary_issuance_detail` (`detail_id`, `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`, `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`, `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`, `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`, `create_time`, `update_time`) VALUES (4, 2, 2, '202501010102', '李四', '后端工程师', 18000.00, 5000.00, 800.00, 600.00, 1440.00, 363.00, 90.00, 1440.00, 300.00, 0.00, 24700.00, 3423.00, 21277.00, '2025-01-25 10:00:00', '2025-01-25 10:00:00');
INSERT INTO `salary_issuance_detail` (`detail_id`, `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`, `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`, `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`, `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`, `create_time`, `update_time`) VALUES (5, 2, 6, '202501010202', '周八', '后端工程师', 14000.00, 4000.00, 700.00, 550.00, 1120.00, 283.00, 70.00, 1120.00, 300.00, 0.00, 19550.00, 2593.00, 16957.00, '2025-01-25 10:00:00', '2025-01-25 10:00:00');
-- 发放单3：产品组2025年1月（2人）
INSERT INTO `salary_issuance_detail` (`detail_id`, `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`, `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`, `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`, `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`, `create_time`, `update_time`) VALUES (6, 3, 3, '202501010201', '王五', '产品经理', 20000.00, 6000.00, 1000.00, 800.00, 1600.00, 403.00, 100.00, 1600.00, 400.00, 0.00, 28200.00, 3703.00, 24497.00, '2025-01-25 11:00:00', '2025-01-25 11:00:00');
INSERT INTO `salary_issuance_detail` (`detail_id`, `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`, `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`, `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`, `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`, `create_time`, `update_time`) VALUES (7, 3, 7, '202501010301', '吴九', '产品经理', 15000.00, 4500.00, 800.00, 600.00, 1200.00, 303.00, 75.00, 1200.00, 350.00, 0.00, 21250.00, 2778.00, 18472.00, '2025-01-25 11:00:00', '2025-01-25 11:00:00');
-- 发放单4：测试一组2025年1月（2人）
INSERT INTO `salary_issuance_detail` (`detail_id`, `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`, `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`, `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`, `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`, `create_time`, `update_time`) VALUES (8, 4, 4, '202501020101', '赵六', '测试工程师', 12000.00, 3000.00, 500.00, 400.00, 960.00, 243.00, 60.00, 960.00, 200.00, 0.00, 16100.00, 2223.00, 13877.00, '2025-01-25 12:00:00', '2025-01-25 12:00:00');
INSERT INTO `salary_issuance_detail` (`detail_id`, `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`, `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`, `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`, `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`, `create_time`, `update_time`) VALUES (9, 4, 8, '202501020102', '郑十', '测试工程师', 11000.00, 2500.00, 450.00, 350.00, 880.00, 223.00, 55.00, 880.00, 150.00, 0.00, 14450.00, 2038.00, 12412.00, '2025-01-25 12:00:00', '2025-01-25 12:00:00');
-- 发放单5：前端组2025年2月（3人）
INSERT INTO `salary_issuance_detail` (`detail_id`, `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`, `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`, `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`, `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`, `create_time`, `update_time`) VALUES (10, 5, 1, '202501010101', '张三', '前端工程师', 25000.00, 8000.00, 1000.00, 800.00, 2000.00, 503.00, 125.00, 2000.00, 500.00, 0.00, 35300.00, 4628.00, 30672.00, '2025-02-25 09:00:00', '2025-02-25 09:00:00');
INSERT INTO `salary_issuance_detail` (`detail_id`, `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`, `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`, `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`, `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`, `create_time`, `update_time`) VALUES (11, 5, 5, '202501010103', '孙七', '前端工程师', 13000.00, 3500.00, 600.00, 500.00, 1040.00, 263.00, 65.00, 1040.00, 250.00, 0.00, 17850.00, 2408.00, 15442.00, '2025-02-25 09:00:00', '2025-02-25 09:00:00');
INSERT INTO `salary_issuance_detail` (`detail_id`, `issuance_id`, `employee_id`, `employee_number`, `employee_name`, `position_name`, `basic_salary`, `performance_bonus`, `transportation_allowance`, `meal_allowance`, `pension_insurance`, `medical_insurance`, `unemployment_insurance`, `housing_fund`, `award_amount`, `deduction_amount`, `total_income`, `total_deduction`, `net_pay`, `create_time`, `update_time`) VALUES (12, 5, 10, '202501010104', '冯十二', '前端工程师', 16000.00, 4500.00, 700.00, 550.00, 1280.00, 323.00, 80.00, 1280.00, 300.00, 0.00, 22050.00, 2963.00, 19087.00, '2025-02-25 09:00:00', '2025-02-25 09:00:00');
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
INSERT INTO `salary_standard` (`standard_id`, `standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES (1, 'SAL202501001', '前端工程师-高级标准', 1, 'SENIOR', 1, 4, '2025-01-10 09:00:00', 5, '2025-01-12 10:00:00', '薪酬标准合理，符合市场水平，同意通过。', 'APPROVED', '2025-01-10 09:00:00', '2025-01-12 10:00:00');
INSERT INTO `salary_standard` (`standard_id`, `standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES (2, 'SAL202501002', '后端工程师-中级标准', 2, 'INTERMEDIATE', 1, 4, '2025-01-10 10:00:00', 5, '2025-01-12 11:00:00', '标准制定合理，审核通过。', 'APPROVED', '2025-01-10 10:00:00', '2025-01-12 11:00:00');
INSERT INTO `salary_standard` (`standard_id`, `standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES (3, 'SAL202501003', '产品经理-中级标准', 3, 'INTERMEDIATE', 1, 4, '2025-01-10 11:00:00', 5, '2025-01-12 12:00:00', '薪酬标准符合职位要求，同意通过。', 'APPROVED', '2025-01-10 11:00:00', '2025-01-12 12:00:00');
INSERT INTO `salary_standard` (`standard_id`, `standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES (4, 'SAL202501004', '测试工程师-初级标准', 4, 'JUNIOR', 1, 4, '2025-01-10 12:00:00', 5, '2025-01-12 13:00:00', '标准合理，审核通过。', 'APPROVED', '2025-01-10 12:00:00', '2025-01-12 13:00:00');
INSERT INTO `salary_standard` (`standard_id`, `standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES (5, 'SAL202501005', '前端工程师-初级标准', 1, 'JUNIOR', 1, 4, '2025-01-10 13:00:00', 5, '2025-01-12 14:00:00', '审核通过。', 'APPROVED', '2025-01-10 13:00:00', '2025-01-12 14:00:00');
INSERT INTO `salary_standard` (`standard_id`, `standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES (6, 'SAL202501006', '后端工程师-初级标准', 2, 'JUNIOR', 1, 4, '2025-01-10 14:00:00', 5, '2025-01-12 15:00:00', '标准合理，同意通过。', 'APPROVED', '2025-01-10 14:00:00', '2025-01-12 15:00:00');
INSERT INTO `salary_standard` (`standard_id`, `standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES (7, 'SAL202501007', '产品经理-初级标准', 3, 'JUNIOR', 1, 4, '2025-01-10 15:00:00', 5, '2025-01-12 16:00:00', '审核通过。', 'APPROVED', '2025-01-10 15:00:00', '2025-01-12 16:00:00');
INSERT INTO `salary_standard` (`standard_id`, `standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES (8, 'SAL202501008', '测试工程师-初级标准（补充）', 4, 'JUNIOR', 1, 4, '2025-01-10 16:00:00', 5, '2025-01-12 17:00:00', '标准合理，同意通过。', 'APPROVED', '2025-01-10 16:00:00', '2025-01-12 17:00:00');
INSERT INTO `salary_standard` (`standard_id`, `standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES (9, 'SAL202501009', '前端工程师-高级标准（市场中心）', 1, 'SENIOR', 1, 4, '2025-01-10 17:00:00', 5, '2025-01-12 18:00:00', '审核通过。', 'APPROVED', '2025-01-10 17:00:00', '2025-01-12 18:00:00');
INSERT INTO `salary_standard` (`standard_id`, `standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES (10, 'SAL202501010', '前端工程师-中级标准', 1, 'INTERMEDIATE', 1, 4, '2025-01-10 18:00:00', 5, '2025-01-12 19:00:00', '标准合理，同意通过。', 'APPROVED', '2025-01-10 18:00:00', '2025-01-12 19:00:00');
INSERT INTO `salary_standard` (`standard_id`, `standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES (11, 'SAL202501011', '后端工程师-高级标准', 2, 'SENIOR', 1, 4, '2025-01-10 19:00:00', NULL, NULL, NULL, 'PENDING_REVIEW', '2025-01-10 19:00:00', '2025-01-10 19:00:00');
INSERT INTO `salary_standard` (`standard_id`, `standard_code`, `standard_name`, `position_id`, `job_title`, `formulator_id`, `registrar_id`, `registration_time`, `reviewer_id`, `review_time`, `review_comments`, `status`, `create_time`, `update_time`) VALUES (12, 'SAL202501012', '产品经理-高级标准', 3, 'SENIOR', 1, 4, '2025-01-10 20:00:00', NULL, NULL, NULL, 'PENDING_REVIEW', '2025-01-10 20:00:00', '2025-01-10 20:00:00');
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
-- 标准1：前端工程师-高级标准
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (1, 1, 1, 25000.00, 0, '2025-01-10 09:00:00', '2025-01-10 09:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (2, 1, 2, 8000.00, 0, '2025-01-10 09:00:00', '2025-01-10 09:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (3, 1, 3, 1000.00, 0, '2025-01-10 09:00:00', '2025-01-10 09:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (4, 1, 4, 800.00, 0, '2025-01-10 09:00:00', '2025-01-10 09:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (5, 1, 5, 500.00, 0, '2025-01-10 09:00:00', '2025-01-10 09:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (6, 1, 6, 2000.00, 1, '2025-01-10 09:00:00', '2025-01-10 09:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (7, 1, 7, 503.00, 1, '2025-01-10 09:00:00', '2025-01-10 09:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (8, 1, 8, 125.00, 1, '2025-01-10 09:00:00', '2025-01-10 09:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (9, 1, 9, 2000.00, 1, '2025-01-10 09:00:00', '2025-01-10 09:00:00');
-- 标准2：后端工程师-中级标准
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (10, 2, 1, 18000.00, 0, '2025-01-10 10:00:00', '2025-01-10 10:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (11, 2, 2, 5000.00, 0, '2025-01-10 10:00:00', '2025-01-10 10:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (12, 2, 3, 800.00, 0, '2025-01-10 10:00:00', '2025-01-10 10:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (13, 2, 4, 600.00, 0, '2025-01-10 10:00:00', '2025-01-10 10:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (14, 2, 5, 300.00, 0, '2025-01-10 10:00:00', '2025-01-10 10:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (15, 2, 6, 1440.00, 1, '2025-01-10 10:00:00', '2025-01-10 10:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (16, 2, 7, 363.00, 1, '2025-01-10 10:00:00', '2025-01-10 10:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (17, 2, 8, 90.00, 1, '2025-01-10 10:00:00', '2025-01-10 10:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (18, 2, 9, 1440.00, 1, '2025-01-10 10:00:00', '2025-01-10 10:00:00');
-- 标准3：产品经理-中级标准
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (19, 3, 1, 20000.00, 0, '2025-01-10 11:00:00', '2025-01-10 11:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (20, 3, 2, 6000.00, 0, '2025-01-10 11:00:00', '2025-01-10 11:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (21, 3, 3, 1000.00, 0, '2025-01-10 11:00:00', '2025-01-10 11:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (22, 3, 4, 800.00, 0, '2025-01-10 11:00:00', '2025-01-10 11:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (23, 3, 5, 400.00, 0, '2025-01-10 11:00:00', '2025-01-10 11:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (24, 3, 6, 1600.00, 1, '2025-01-10 11:00:00', '2025-01-10 11:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (25, 3, 7, 403.00, 1, '2025-01-10 11:00:00', '2025-01-10 11:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (26, 3, 8, 100.00, 1, '2025-01-10 11:00:00', '2025-01-10 11:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (27, 3, 9, 1600.00, 1, '2025-01-10 11:00:00', '2025-01-10 11:00:00');
-- 标准4：测试工程师-初级标准
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (28, 4, 1, 12000.00, 0, '2025-01-10 12:00:00', '2025-01-10 12:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (29, 4, 2, 3000.00, 0, '2025-01-10 12:00:00', '2025-01-10 12:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (30, 4, 3, 500.00, 0, '2025-01-10 12:00:00', '2025-01-10 12:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (31, 4, 4, 400.00, 0, '2025-01-10 12:00:00', '2025-01-10 12:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (32, 4, 5, 200.00, 0, '2025-01-10 12:00:00', '2025-01-10 12:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (33, 4, 6, 960.00, 1, '2025-01-10 12:00:00', '2025-01-10 12:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (34, 4, 7, 243.00, 1, '2025-01-10 12:00:00', '2025-01-10 12:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (35, 4, 8, 60.00, 1, '2025-01-10 12:00:00', '2025-01-10 12:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (36, 4, 9, 960.00, 1, '2025-01-10 12:00:00', '2025-01-10 12:00:00');
-- 标准5：前端工程师-初级标准
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (37, 5, 1, 13000.00, 0, '2025-01-10 13:00:00', '2025-01-10 13:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (38, 5, 2, 3500.00, 0, '2025-01-10 13:00:00', '2025-01-10 13:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (39, 5, 3, 600.00, 0, '2025-01-10 13:00:00', '2025-01-10 13:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (40, 5, 4, 500.00, 0, '2025-01-10 13:00:00', '2025-01-10 13:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (41, 5, 5, 250.00, 0, '2025-01-10 13:00:00', '2025-01-10 13:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (42, 5, 6, 1040.00, 1, '2025-01-10 13:00:00', '2025-01-10 13:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (43, 5, 7, 263.00, 1, '2025-01-10 13:00:00', '2025-01-10 13:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (44, 5, 8, 65.00, 1, '2025-01-10 13:00:00', '2025-01-10 13:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (45, 5, 9, 1040.00, 1, '2025-01-10 13:00:00', '2025-01-10 13:00:00');
-- 标准6：后端工程师-初级标准
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (46, 6, 1, 14000.00, 0, '2025-01-10 14:00:00', '2025-01-10 14:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (47, 6, 2, 4000.00, 0, '2025-01-10 14:00:00', '2025-01-10 14:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (48, 6, 3, 700.00, 0, '2025-01-10 14:00:00', '2025-01-10 14:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (49, 6, 4, 550.00, 0, '2025-01-10 14:00:00', '2025-01-10 14:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (50, 6, 5, 300.00, 0, '2025-01-10 14:00:00', '2025-01-10 14:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (51, 6, 6, 1120.00, 1, '2025-01-10 14:00:00', '2025-01-10 14:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (52, 6, 7, 283.00, 1, '2025-01-10 14:00:00', '2025-01-10 14:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (53, 6, 8, 70.00, 1, '2025-01-10 14:00:00', '2025-01-10 14:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (54, 6, 9, 1120.00, 1, '2025-01-10 14:00:00', '2025-01-10 14:00:00');
-- 标准7：产品经理-初级标准
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (55, 7, 1, 15000.00, 0, '2025-01-10 15:00:00', '2025-01-10 15:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (56, 7, 2, 4500.00, 0, '2025-01-10 15:00:00', '2025-01-10 15:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (57, 7, 3, 800.00, 0, '2025-01-10 15:00:00', '2025-01-10 15:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (58, 7, 4, 600.00, 0, '2025-01-10 15:00:00', '2025-01-10 15:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (59, 7, 5, 350.00, 0, '2025-01-10 15:00:00', '2025-01-10 15:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (60, 7, 6, 1200.00, 1, '2025-01-10 15:00:00', '2025-01-10 15:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (61, 7, 7, 303.00, 1, '2025-01-10 15:00:00', '2025-01-10 15:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (62, 7, 8, 75.00, 1, '2025-01-10 15:00:00', '2025-01-10 15:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (63, 7, 9, 1200.00, 1, '2025-01-10 15:00:00', '2025-01-10 15:00:00');
-- 标准8：测试工程师-初级标准（补充）
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (64, 8, 1, 11000.00, 0, '2025-01-10 16:00:00', '2025-01-10 16:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (65, 8, 2, 2500.00, 0, '2025-01-10 16:00:00', '2025-01-10 16:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (66, 8, 3, 450.00, 0, '2025-01-10 16:00:00', '2025-01-10 16:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (67, 8, 4, 350.00, 0, '2025-01-10 16:00:00', '2025-01-10 16:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (68, 8, 5, 150.00, 0, '2025-01-10 16:00:00', '2025-01-10 16:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (69, 8, 6, 880.00, 1, '2025-01-10 16:00:00', '2025-01-10 16:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (70, 8, 7, 223.00, 1, '2025-01-10 16:00:00', '2025-01-10 16:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (71, 8, 8, 55.00, 1, '2025-01-10 16:00:00', '2025-01-10 16:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (72, 8, 9, 880.00, 1, '2025-01-10 16:00:00', '2025-01-10 16:00:00');
-- 标准9：前端工程师-高级标准（市场中心）
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (73, 9, 1, 24000.00, 0, '2025-01-10 17:00:00', '2025-01-10 17:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (74, 9, 2, 7500.00, 0, '2025-01-10 17:00:00', '2025-01-10 17:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (75, 9, 3, 950.00, 0, '2025-01-10 17:00:00', '2025-01-10 17:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (76, 9, 4, 750.00, 0, '2025-01-10 17:00:00', '2025-01-10 17:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (77, 9, 5, 450.00, 0, '2025-01-10 17:00:00', '2025-01-10 17:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (78, 9, 6, 1920.00, 1, '2025-01-10 17:00:00', '2025-01-10 17:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (79, 9, 7, 483.00, 1, '2025-01-10 17:00:00', '2025-01-10 17:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (80, 9, 8, 120.00, 1, '2025-01-10 17:00:00', '2025-01-10 17:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (81, 9, 9, 1920.00, 1, '2025-01-10 17:00:00', '2025-01-10 17:00:00');
-- 标准10：前端工程师-中级标准
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (82, 10, 1, 16000.00, 0, '2025-01-10 18:00:00', '2025-01-10 18:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (83, 10, 2, 4500.00, 0, '2025-01-10 18:00:00', '2025-01-10 18:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (84, 10, 3, 700.00, 0, '2025-01-10 18:00:00', '2025-01-10 18:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (85, 10, 4, 550.00, 0, '2025-01-10 18:00:00', '2025-01-10 18:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (86, 10, 5, 300.00, 0, '2025-01-10 18:00:00', '2025-01-10 18:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (87, 10, 6, 1280.00, 1, '2025-01-10 18:00:00', '2025-01-10 18:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (88, 10, 7, 323.00, 1, '2025-01-10 18:00:00', '2025-01-10 18:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (89, 10, 8, 80.00, 1, '2025-01-10 18:00:00', '2025-01-10 18:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (90, 10, 9, 1280.00, 1, '2025-01-10 18:00:00', '2025-01-10 18:00:00');
-- 标准11：后端工程师-高级标准（待审核）
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (91, 11, 1, 22000.00, 0, '2025-01-10 19:00:00', '2025-01-10 19:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (92, 11, 2, 7000.00, 0, '2025-01-10 19:00:00', '2025-01-10 19:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (93, 11, 3, 900.00, 0, '2025-01-10 19:00:00', '2025-01-10 19:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (94, 11, 4, 700.00, 0, '2025-01-10 19:00:00', '2025-01-10 19:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (95, 11, 5, 400.00, 0, '2025-01-10 19:00:00', '2025-01-10 19:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (96, 11, 6, 1760.00, 1, '2025-01-10 19:00:00', '2025-01-10 19:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (97, 11, 7, 443.00, 1, '2025-01-10 19:00:00', '2025-01-10 19:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (98, 11, 8, 110.00, 1, '2025-01-10 19:00:00', '2025-01-10 19:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (99, 11, 9, 1760.00, 1, '2025-01-10 19:00:00', '2025-01-10 19:00:00');
-- 标准12：产品经理-高级标准（待审核）
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (100, 12, 1, 23000.00, 0, '2025-01-10 20:00:00', '2025-01-10 20:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (101, 12, 2, 7500.00, 0, '2025-01-10 20:00:00', '2025-01-10 20:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (102, 12, 3, 1000.00, 0, '2025-01-10 20:00:00', '2025-01-10 20:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (103, 12, 4, 800.00, 0, '2025-01-10 20:00:00', '2025-01-10 20:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (104, 12, 5, 450.00, 0, '2025-01-10 20:00:00', '2025-01-10 20:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (105, 12, 6, 1840.00, 1, '2025-01-10 20:00:00', '2025-01-10 20:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (106, 12, 7, 463.00, 1, '2025-01-10 20:00:00', '2025-01-10 20:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (107, 12, 8, 115.00, 1, '2025-01-10 20:00:00', '2025-01-10 20:00:00');
INSERT INTO `salary_standard_item` (`standard_item_id`, `standard_id`, `item_id`, `amount`, `is_calculated`, `create_time`, `update_time`) VALUES (108, 12, 9, 1840.00, 1, '2025-01-10 20:00:00', '2025-01-10 20:00:00');
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
INSERT INTO `user` (`user_id`, `username`, `password`, `real_name`, `role`, `email`, `phone`, `status`, `create_time`, `update_time`) VALUES (1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwxi8xNa', '系统管理员', 'HR_MANAGER', 'admin@example.com', '13800138000', 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `user` (`user_id`, `username`, `password`, `real_name`, `role`, `email`, `phone`, `status`, `create_time`, `update_time`) VALUES (2, 'hr01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwxi8xNa', '王管理员', 'HR_SPECIALIST', 'hr01@example.com', '13800138001', 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `user` (`user_id`, `username`, `password`, `real_name`, `role`, `email`, `phone`, `status`, `create_time`, `update_time`) VALUES (3, 'hr02', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwxi8xNa', '李管理员', 'HR_MANAGER', 'hr02@example.com', '13800138002', 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `user` (`user_id`, `username`, `password`, `real_name`, `role`, `email`, `phone`, `status`, `create_time`, `update_time`) VALUES (4, 'salary01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwxi8xNa', '张经理', 'SALARY_SPECIALIST', 'salary01@example.com', '13800138003', 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
INSERT INTO `user` (`user_id`, `username`, `password`, `real_name`, `role`, `email`, `phone`, `status`, `create_time`, `update_time`) VALUES (5, 'salary02', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwxi8xNa', '李经理', 'SALARY_MANAGER', 'salary02@example.com', '13800138004', 'ACTIVE', '2025-11-04 11:31:53', '2025-11-04 11:31:53');
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
