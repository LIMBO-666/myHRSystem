-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: myHRSystem
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `employee_archive`
--

DROP TABLE IF EXISTS `employee_archive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='员工档案表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_archive`
--

LOCK TABLES `employee_archive` WRITE;
/*!40000 ALTER TABLE `employee_archive` DISABLE KEYS */;
INSERT INTO `employee_archive` VALUES (1,'202501010101','张三','MALE','110101199001011234','1990-01-01',35,'中国','北京','汉族','无','群众','本科','计算机科学与技术','zhangsan@example.com','010-12345678','123456789','13800138001','北京市朝阳区xxx街道xxx号','100000','阅读、编程','2010-2014 就读于XX大学计算机系...','父亲：张XX，母亲：李XX','工作认真负责',NULL,1,3,6,1,'INTERMEDIATE',2,2,'2025-01-20 09:00:00',3,'2025-01-21 10:30:00','档案信息完整，已通过复核','NORMAL',NULL,NULL,'2025-01-20 09:00:00','2025-12-15 20:36:09'),(2,'202501010201','李四','MALE','110101199205152345','1992-05-15',33,'中国','上海','汉族','无','团员','本科','软件工程','lisi@example.com','021-87654321','987654321','13900139002','上海市浦东新区xxx路xxx号','200000','运动、旅游','2012-2016 就读于XX大学软件工程系...','父亲：李XX，母亲：王XX','技术能力强',NULL,1,3,7,2,'INTERMEDIATE',4,2,'2025-01-20 09:30:00',3,'2025-01-21 11:00:00','档案信息完整，已通过复核','NORMAL',NULL,NULL,'2025-01-20 09:30:00','2025-01-21 11:00:00'),(3,'202501010301','王五','FEMALE','110101199308203456','1993-08-20',32,'中国','广州','汉族','无','党员','硕士','产品设计','wangwu@example.com','020-12345678','111222333','13700137003','广州市天河区xxx大道xxx号','510000','设计、摄影','2014-2017 就读于XX大学设计系...','父亲：王XX，母亲：赵XX','产品思维好',NULL,1,3,8,3,'INTERMEDIATE',6,2,'2025-01-20 10:00:00',3,'2025-01-21 11:30:00','档案信息完整，已通过复核','NORMAL',NULL,NULL,'2025-01-20 10:00:00','2025-01-21 11:30:00'),(4,'202501010102','赵六','MALE','110101199506254567','1995-06-25',30,'中国','深圳','汉族','无','群众','本科','计算机科学与技术','zhaoliu@example.com','0755-12345678','222333444','13600136004','深圳市南山区xxx路xxx号','518000','游戏、电影','2013-2017 就读于XX大学计算机系...','父亲：赵XX，母亲：钱XX',NULL,NULL,1,3,6,1,'JUNIOR',1,2,'2025-01-25 14:00:00',3,'2025-12-15 20:40:07',NULL,'NORMAL',NULL,NULL,'2025-01-25 14:00:00','2025-01-25 14:00:00'),(5,'202501010202','孙七','FEMALE','110101199710305678','1997-10-30',28,'中国','杭州','汉族','无','团员','本科','软件工程','sunqi@example.com','0571-87654321','333444555','13500135005','杭州市西湖区xxx街xxx号','310000','音乐、阅读','2015-2019 就读于XX大学软件工程系...','父亲：孙XX，母亲：周XX',NULL,NULL,1,3,7,2,'JUNIOR',8,2,'2025-01-25 15:00:00',3,'2025-12-15 20:40:53',NULL,'NORMAL',NULL,NULL,'2025-01-25 15:00:00','2025-01-25 15:00:00'),(6,'202503010101','婉洁','FEMALE','441481201544558','2025-11-05',0,'中国','1','汉族','无','无','本科','人工智能','441481554@qq.com','89524563','1','12344678','555','514600','1','无','无','无','/photofile/202503010101.png',10,11,12,5,'SENIOR',7,2,'2025-12-15 20:31:36',3,'2025-12-15 20:31:45',NULL,'NORMAL',NULL,NULL,'2025-12-15 20:31:36','2025-12-15 20:31:36'),(7,'202501010103','李强','MALE','202311701133','2025-12-02',0,'中国','1','苗族','无','无','本科','软件工程','4414554@qq.com','89524563','1','72727827','5','514600','1','1','1','1','/photofile/202501010103.png',1,3,6,1,'INTERMEDIATE',2,2,'2025-12-15 20:39:08',3,'2025-12-15 20:39:42',NULL,'DELETED','2025-12-15 21:07:00','1','2025-12-15 20:39:07','2025-12-15 21:07:00'),(8,'202501010104','李黑','MALE','20231','2025-12-02',0,'中国','1','壮族','无','无','博士','软件工程','44554@qq.com','89524','1','8952','5','514600','1','7','7','7','/photofile/202501010104.png',1,3,6,1,'SENIOR',3,2,'2025-12-15 21:08:41',3,'2025-12-15 21:08:50',NULL,'NORMAL',NULL,NULL,'2025-12-15 21:08:41','2025-12-15 21:08:41');
/*!40000 ALTER TABLE `employee_archive` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization`
--

DROP TABLE IF EXISTS `organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='机构表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization`
--

LOCK TABLES `organization` WRITE;
/*!40000 ALTER TABLE `organization` DISABLE KEYS */;
INSERT INTO `organization` VALUES (1,'01','技术中心',1,NULL,NULL,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(2,'02','市场中心',1,NULL,NULL,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(3,'01','产品研发部',2,1,NULL,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(4,'02','测试部',2,1,NULL,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(5,'01','市场推广部',2,2,NULL,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(6,'01','前端组',3,3,NULL,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(7,'02','后端组',3,3,NULL,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(8,'03','产品组',3,3,NULL,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(9,'01','测试一组',3,4,NULL,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(10,'03','最终测试 一级机构',1,NULL,NULL,'ACTIVE','2025-12-15 20:20:33','2025-12-15 20:20:33'),(11,'01','最终测试 二级机构',2,10,NULL,'ACTIVE','2025-12-15 20:20:45','2025-12-15 20:20:45'),(12,'01','最终测试 三级机构',3,11,NULL,'ACTIVE','2025-12-15 20:21:14','2025-12-15 20:21:14');
/*!40000 ALTER TABLE `organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `position`
--

DROP TABLE IF EXISTS `position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='职位表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `position`
--

LOCK TABLES `position` WRITE;
/*!40000 ALTER TABLE `position` DISABLE KEYS */;
INSERT INTO `position` VALUES (1,'前端工程师',6,NULL,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(2,'后端工程师',7,NULL,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(3,'产品经理',8,NULL,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(4,'测试工程师',9,NULL,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(5,'测试机构-高级职位',12,NULL,'ACTIVE','2025-12-15 20:21:43','2025-12-15 20:21:43');
/*!40000 ALTER TABLE `position` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_issuance`
--

DROP TABLE IF EXISTS `salary_issuance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='薪酬发放单表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_issuance`
--

LOCK TABLES `salary_issuance` WRITE;
/*!40000 ALTER TABLE `salary_issuance` DISABLE KEYS */;
INSERT INTO `salary_issuance` VALUES (3,'PAY202512001',12,1,5000.00,5572.00,'2025-12-01',NULL,4,'2025-12-15 20:33:10',5,'2025-12-15 20:34:02',NULL,'EXECUTED',NULL,'2025-12-15 20:33:09','2025-12-15 20:34:02');
/*!40000 ALTER TABLE `salary_issuance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_issuance_detail`
--

DROP TABLE IF EXISTS `salary_issuance_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='薪酬发放明细表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_issuance_detail`
--

LOCK TABLES `salary_issuance_detail` WRITE;
/*!40000 ALTER TABLE `salary_issuance_detail` DISABLE KEYS */;
INSERT INTO `salary_issuance_detail` VALUES (4,3,6,'202503010101','婉洁','测试机构-高级职位',5000.00,600.00,500.00,400.00,400.00,103.00,25.00,400.00,0.00,0.00,6500.00,928.00,5572.00,'2025-12-15 20:33:09','2025-12-15 20:33:09');
/*!40000 ALTER TABLE `salary_issuance_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_item`
--

DROP TABLE IF EXISTS `salary_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='薪酬项目表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_item`
--

LOCK TABLES `salary_item` WRITE;
/*!40000 ALTER TABLE `salary_item` DISABLE KEYS */;
INSERT INTO `salary_item` VALUES (1,'S001','基本工资','INCOME',NULL,1,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(2,'S002','绩效奖金','INCOME',NULL,2,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(3,'S003','交通补贴','INCOME',NULL,3,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(4,'S004','餐费补贴','INCOME',NULL,4,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(5,'S005','全勤奖','INCOME',NULL,5,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(6,'S006','养老保险','DEDUCTION','基本工资*8%',6,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(7,'S007','医疗保险','DEDUCTION','基本工资*2%+3',7,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(8,'S008','失业保险','DEDUCTION','基本工资*0.5%',8,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(9,'S009','住房公积金','DEDUCTION','基本工资*8%',9,'ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(10,'S010','补贴','INCOME','S001*30',10,'ACTIVE','2025-12-15 20:23:28','2025-12-15 21:21:08'),(11,'S011','后端补贴','INCOME','S010*200',11,'ACTIVE','2025-12-15 22:35:15','2025-12-15 22:35:15');
/*!40000 ALTER TABLE `salary_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_standard`
--

DROP TABLE IF EXISTS `salary_standard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='薪酬标准表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_standard`
--

LOCK TABLES `salary_standard` WRITE;
/*!40000 ALTER TABLE `salary_standard` DISABLE KEYS */;
INSERT INTO `salary_standard` VALUES (1,'SAL202501001','前端工程师-初级标准',1,'JUNIOR',4,4,'2025-12-15 21:57:03',5,'2025-12-15 22:00:13','标准合理，已通过','APPROVED','2025-01-15 10:00:00','2025-12-15 22:00:12'),(2,'SAL202501002','前端工程师-中级标准',1,'INTERMEDIATE',4,4,'2025-12-15 21:44:52',5,'2025-12-15 21:45:36','标准合理，已通过','APPROVED','2025-01-15 10:00:00','2025-12-15 21:45:36'),(3,'SAL202501003','前端工程师-高级级标准',1,'SENIOR',4,4,'2025-12-15 21:45:23',5,'2025-12-15 21:45:35','','APPROVED','2025-01-15 10:00:00','2025-12-15 21:45:34'),(4,'SAL202501004','后端工程师-中级标准',2,'INTERMEDIATE',4,4,'2025-12-15 22:36:01',5,'2025-12-15 22:36:11','标准合理，已通过','APPROVED','2025-01-15 10:00:00','2025-12-15 22:36:10'),(5,'SAL202501005','后端工程师-高级标准',2,'SENIOR',NULL,4,'2025-01-15 10:00:00',5,'2025-01-16 14:30:00','标准合理，已通过','APPROVED','2025-01-15 10:00:00','2025-01-16 14:30:00'),(6,'SAL202501006','产品经理-中级标准',3,'INTERMEDIATE',NULL,4,'2025-01-15 10:00:00',5,'2025-01-16 14:30:00','标准合理，已通过','APPROVED','2025-01-15 10:00:00','2025-01-16 14:30:00'),(7,'SAL202512001','测试机构-高级',5,'SENIOR',4,4,'2025-12-15 20:30:04',5,'2025-12-15 20:30:28','','APPROVED','2025-12-15 20:30:03','2025-12-15 20:30:28'),(8,'SAL202512002','后端工程师-初级标准',2,'JUNIOR',4,4,'2025-12-15 20:46:27',5,'2025-12-15 20:47:19','','APPROVED','2025-12-15 20:46:26','2025-12-15 20:47:19');
/*!40000 ALTER TABLE `salary_standard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_standard_item`
--

DROP TABLE IF EXISTS `salary_standard_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=114 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='薪酬标准明细表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_standard_item`
--

LOCK TABLES `salary_standard_item` WRITE;
/*!40000 ALTER TABLE `salary_standard_item` DISABLE KEYS */;
INSERT INTO `salary_standard_item` VALUES (37,5,1,20000.00,0,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(38,5,2,6000.00,0,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(39,5,3,800.00,0,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(40,5,4,500.00,0,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(41,5,5,300.00,0,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(42,5,6,0.00,1,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(43,5,7,0.00,1,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(44,5,8,0.00,1,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(45,5,9,0.00,1,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(46,6,1,15000.00,0,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(47,6,2,4000.00,0,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(48,6,3,600.00,0,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(49,6,4,400.00,0,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(50,6,5,300.00,0,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(51,6,6,0.00,1,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(52,6,7,0.00,1,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(53,6,8,0.00,1,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(54,6,9,0.00,1,'2025-01-15 10:00:00','2025-01-15 10:00:00'),(55,7,1,5000.00,0,'2025-12-15 20:30:03','2025-12-15 20:30:03'),(56,7,2,600.00,0,'2025-12-15 20:30:03','2025-12-15 20:30:03'),(57,7,3,500.00,0,'2025-12-15 20:30:03','2025-12-15 20:30:03'),(58,7,4,400.00,0,'2025-12-15 20:30:03','2025-12-15 20:30:03'),(59,7,5,800.00,0,'2025-12-15 20:30:03','2025-12-15 20:30:03'),(60,7,6,400.00,1,'2025-12-15 20:30:03','2025-12-15 20:30:03'),(61,7,7,103.00,1,'2025-12-15 20:30:03','2025-12-15 20:30:03'),(62,7,8,25.00,1,'2025-12-15 20:30:03','2025-12-15 20:30:03'),(63,7,9,400.00,1,'2025-12-15 20:30:03','2025-12-15 20:30:03'),(64,7,10,0.00,1,'2025-12-15 20:30:03','2025-12-15 20:30:03'),(65,8,1,2500.00,0,'2025-12-15 20:46:26','2025-12-15 20:46:26'),(66,8,2,600.00,0,'2025-12-15 20:46:26','2025-12-15 20:46:26'),(67,8,3,400.00,0,'2025-12-15 20:46:26','2025-12-15 20:46:26'),(68,8,4,50.00,0,'2025-12-15 20:46:26','2025-12-15 20:46:26'),(69,8,5,800.00,0,'2025-12-15 20:46:26','2025-12-15 20:46:26'),(70,8,6,200.00,1,'2025-12-15 20:46:26','2025-12-15 20:46:26'),(71,8,7,53.00,1,'2025-12-15 20:46:26','2025-12-15 20:46:26'),(72,8,8,12.50,1,'2025-12-15 20:46:26','2025-12-15 20:46:26'),(73,8,9,200.00,1,'2025-12-15 20:46:26','2025-12-15 20:46:26'),(74,8,10,0.00,1,'2025-12-15 20:46:26','2025-12-15 20:46:26'),(84,2,1,4000.00,0,'2025-12-15 21:44:52','2025-12-15 21:44:52'),(85,2,2,2000.00,0,'2025-12-15 21:44:52','2025-12-15 21:44:52'),(86,2,3,500.00,0,'2025-12-15 21:44:52','2025-12-15 21:44:52'),(87,2,4,500.00,0,'2025-12-15 21:44:52','2025-12-15 21:44:52'),(88,2,5,500.00,0,'2025-12-15 21:44:52','2025-12-15 21:44:52'),(89,3,1,8000.00,0,'2025-12-15 21:45:22','2025-12-15 21:45:22'),(90,3,2,5000.00,0,'2025-12-15 21:45:22','2025-12-15 21:45:22'),(91,3,3,200.00,0,'2025-12-15 21:45:22','2025-12-15 21:45:22'),(92,3,4,900.00,0,'2025-12-15 21:45:22','2025-12-15 21:45:22'),(93,3,5,1000.00,0,'2025-12-15 21:45:22','2025-12-15 21:45:22'),(94,3,7,163.00,1,'2025-12-15 21:45:22','2025-12-15 21:45:22'),(95,3,8,40.00,1,'2025-12-15 21:45:22','2025-12-15 21:45:22'),(101,1,1,3000.00,0,'2025-12-15 21:57:03','2025-12-15 21:57:03'),(102,1,2,1000.00,0,'2025-12-15 21:57:03','2025-12-15 21:57:03'),(103,1,3,300.00,0,'2025-12-15 21:57:03','2025-12-15 21:57:03'),(104,1,4,100.00,0,'2025-12-15 21:57:03','2025-12-15 21:57:03'),(105,1,5,500.00,0,'2025-12-15 21:57:03','2025-12-15 21:57:03'),(106,1,6,240.00,1,'2025-12-15 21:57:03','2025-12-15 21:57:03'),(107,4,1,5000.00,0,'2025-12-15 22:36:01','2025-12-15 22:36:01'),(108,4,2,600.00,0,'2025-12-15 22:36:01','2025-12-15 22:36:01'),(109,4,3,100.00,0,'2025-12-15 22:36:01','2025-12-15 22:36:01'),(110,4,4,700.00,0,'2025-12-15 22:36:01','2025-12-15 22:36:01'),(111,4,5,800.00,0,'2025-12-15 22:36:01','2025-12-15 22:36:01'),(112,4,10,1500.00,1,'2025-12-15 22:36:01','2025-12-15 22:36:01'),(113,4,11,3000.00,1,'2025-12-15 22:36:01','2025-12-15 22:36:01');
/*!40000 ALTER TABLE `salary_standard_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `real_name` varchar(50) NOT NULL COMMENT '真实姓名',
  `role` varchar(20) NOT NULL COMMENT '角色：SYSTEM_ADMIN(系统管理员), HR_SPECIALIST(人事专员), HR_MANAGER(人事经理), SALARY_SPECIALIST(薪酬专员), SALARY_MANAGER(薪酬经理)',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '电话',
  `status` varchar(20) DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE(激活), INACTIVE(禁用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  CONSTRAINT `chk_user_role` CHECK ((`role` in (_utf8mb4'SYSTEM_ADMIN',_utf8mb4'HR_SPECIALIST',_utf8mb4'HR_MANAGER',_utf8mb4'SALARY_SPECIALIST',_utf8mb4'SALARY_MANAGER'))),
  CONSTRAINT `chk_user_status` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE')))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','$2a$10$OjBAzQZ5FxSaRAW2JnBGJetniIf.AMMRCa0lRYaI9BWtha.P5xnWi','系统管理员','SYSTEM_ADMIN','admin@example.com','13800138000','ACTIVE','2025-11-04 11:31:53','2025-11-04 11:31:53'),(2,'hr01','$2a$10$OjBAzQZ5FxSaRAW2JnBGJetniIf.AMMRCa0lRYaI9BWtha.P5xnWi','人事陈专员','HR_SPECIALIST','hr01@example.com','13800138001','ACTIVE','2025-11-04 11:31:53','2025-12-15 20:36:46'),(3,'hr02','$2a$10$OjBAzQZ5FxSaRAW2JnBGJetniIf.AMMRCa0lRYaI9BWtha.P5xnWi','人事李经理','HR_MANAGER','hr02@example.com','13800138002','ACTIVE','2025-11-04 11:31:53','2025-12-15 20:36:46'),(4,'salary01','$2a$10$OjBAzQZ5FxSaRAW2JnBGJetniIf.AMMRCa0lRYaI9BWtha.P5xnWi','薪酬张专员','SALARY_SPECIALIST','salary01@example.com','13800138003','ACTIVE','2025-11-04 11:31:53','2025-12-15 20:35:39'),(5,'salary02','$2a$10$OjBAzQZ5FxSaRAW2JnBGJetniIf.AMMRCa0lRYaI9BWtha.P5xnWi','薪酬王经理','SALARY_MANAGER','salary02@example.com','13800138004','ACTIVE','2025-11-04 11:31:53','2025-12-15 20:35:39');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_employee_archive_full`
--

DROP TABLE IF EXISTS `v_employee_archive_full`;
/*!50001 DROP VIEW IF EXISTS `v_employee_archive_full`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_employee_archive_full` AS SELECT 
 1 AS `archive_id`,
 1 AS `archive_number`,
 1 AS `name`,
 1 AS `gender`,
 1 AS `id_number`,
 1 AS `birthday`,
 1 AS `age`,
 1 AS `nationality`,
 1 AS `place_of_birth`,
 1 AS `ethnicity`,
 1 AS `religious_belief`,
 1 AS `political_status`,
 1 AS `education_level`,
 1 AS `major`,
 1 AS `email`,
 1 AS `phone`,
 1 AS `qq`,
 1 AS `mobile`,
 1 AS `address`,
 1 AS `postal_code`,
 1 AS `hobby`,
 1 AS `personal_resume`,
 1 AS `family_relationship`,
 1 AS `remarks`,
 1 AS `photo_url`,
 1 AS `first_org_id`,
 1 AS `second_org_id`,
 1 AS `third_org_id`,
 1 AS `position_id`,
 1 AS `job_title`,
 1 AS `salary_standard_id`,
 1 AS `registrar_id`,
 1 AS `registration_time`,
 1 AS `reviewer_id`,
 1 AS `review_time`,
 1 AS `status`,
 1 AS `delete_time`,
 1 AS `delete_reason`,
 1 AS `create_time`,
 1 AS `update_time`,
 1 AS `first_org_name`,
 1 AS `second_org_name`,
 1 AS `third_org_name`,
 1 AS `position_name`,
 1 AS `registrar_name`,
 1 AS `reviewer_name`,
 1 AS `org_full_path`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_organization_hierarchy`
--

DROP TABLE IF EXISTS `v_organization_hierarchy`;
/*!50001 DROP VIEW IF EXISTS `v_organization_hierarchy`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_organization_hierarchy` AS SELECT 
 1 AS `third_org_id`,
 1 AS `third_org_name`,
 1 AS `second_org_id`,
 1 AS `second_org_name`,
 1 AS `first_org_id`,
 1 AS `first_org_name`,
 1 AS `full_path`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'myHRSystem'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_generate_archive_number` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `v_employee_archive_full`
--

/*!50001 DROP VIEW IF EXISTS `v_employee_archive_full`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_employee_archive_full` AS select `ea`.`archive_id` AS `archive_id`,`ea`.`archive_number` AS `archive_number`,`ea`.`name` AS `name`,`ea`.`gender` AS `gender`,`ea`.`id_number` AS `id_number`,`ea`.`birthday` AS `birthday`,`ea`.`age` AS `age`,`ea`.`nationality` AS `nationality`,`ea`.`place_of_birth` AS `place_of_birth`,`ea`.`ethnicity` AS `ethnicity`,`ea`.`religious_belief` AS `religious_belief`,`ea`.`political_status` AS `political_status`,`ea`.`education_level` AS `education_level`,`ea`.`major` AS `major`,`ea`.`email` AS `email`,`ea`.`phone` AS `phone`,`ea`.`qq` AS `qq`,`ea`.`mobile` AS `mobile`,`ea`.`address` AS `address`,`ea`.`postal_code` AS `postal_code`,`ea`.`hobby` AS `hobby`,`ea`.`personal_resume` AS `personal_resume`,`ea`.`family_relationship` AS `family_relationship`,`ea`.`remarks` AS `remarks`,`ea`.`photo_url` AS `photo_url`,`ea`.`first_org_id` AS `first_org_id`,`ea`.`second_org_id` AS `second_org_id`,`ea`.`third_org_id` AS `third_org_id`,`ea`.`position_id` AS `position_id`,`ea`.`job_title` AS `job_title`,`ea`.`salary_standard_id` AS `salary_standard_id`,`ea`.`registrar_id` AS `registrar_id`,`ea`.`registration_time` AS `registration_time`,`ea`.`reviewer_id` AS `reviewer_id`,`ea`.`review_time` AS `review_time`,`ea`.`status` AS `status`,`ea`.`delete_time` AS `delete_time`,`ea`.`delete_reason` AS `delete_reason`,`ea`.`create_time` AS `create_time`,`ea`.`update_time` AS `update_time`,`o1`.`org_name` AS `first_org_name`,`o2`.`org_name` AS `second_org_name`,`o3`.`org_name` AS `third_org_name`,`p`.`position_name` AS `position_name`,`u1`.`real_name` AS `registrar_name`,`u2`.`real_name` AS `reviewer_name`,concat(`o1`.`org_name`,'/',`o2`.`org_name`,'/',`o3`.`org_name`) AS `org_full_path` from ((((((`employee_archive` `ea` left join `organization` `o1` on((`ea`.`first_org_id` = `o1`.`org_id`))) left join `organization` `o2` on((`ea`.`second_org_id` = `o2`.`org_id`))) left join `organization` `o3` on((`ea`.`third_org_id` = `o3`.`org_id`))) left join `position` `p` on((`ea`.`position_id` = `p`.`position_id`))) left join `user` `u1` on((`ea`.`registrar_id` = `u1`.`user_id`))) left join `user` `u2` on((`ea`.`reviewer_id` = `u2`.`user_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_organization_hierarchy`
--

/*!50001 DROP VIEW IF EXISTS `v_organization_hierarchy`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_organization_hierarchy` AS select `o3`.`org_id` AS `third_org_id`,`o3`.`org_name` AS `third_org_name`,`o2`.`org_id` AS `second_org_id`,`o2`.`org_name` AS `second_org_name`,`o1`.`org_id` AS `first_org_id`,`o1`.`org_name` AS `first_org_name`,concat(`o1`.`org_name`,'/',`o2`.`org_name`,'/',`o3`.`org_name`) AS `full_path` from ((`organization` `o3` left join `organization` `o2` on((`o3`.`parent_id` = `o2`.`org_id`))) left join `organization` `o1` on((`o2`.`parent_id` = `o1`.`org_id`))) where (`o3`.`org_level` = 3) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-15 22:44:53
