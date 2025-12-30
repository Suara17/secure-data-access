/*
 * ==============================================================================
 * 项目名称：基于安全标记的数据库访问控制系统
 * 数据库名：secure_access_db
 * 描述：实现“主体-客体-标记”模型的底层数据结构
 * 版本：MySQL 8.0+
 * ==============================================================================
 */

-- 1. 创建并使用数据库
CREATE DATABASE IF NOT EXISTS secure_access_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE secure_access_db;

-- ==============================================================================
-- 第一部分：基础字典表 (构建安全标记维度)
-- ==============================================================================

-- -----------------------------------------------------
-- 表1：安全等级表 (Security Levels)
-- 对应文档中的“公开-内部-秘密-机密”四级标记 
-- -----------------------------------------------------
DROP TABLE IF EXISTS sys_security_level;
CREATE TABLE sys_security_level (
  level_id INT NOT NULL PRIMARY KEY COMMENT '等级ID',
  level_name VARCHAR(50) NOT NULL COMMENT '等级名称',
  level_weight INT NOT NULL COMMENT '权重值(用于比较)：1<2<3<4',
  description VARCHAR(255) COMMENT '描述'
) COMMENT='安全等级字典表';

-- 初始化安全等级数据
INSERT INTO sys_security_level VALUES 
(1, '公开 (Public)', 1, '对外公开，无危害'),
(2, '内部 (Internal)', 2, '仅限内部员工，不可对外'),
(3, '秘密 (Secret)', 3, '部门内部敏感数据'),
(4, '机密 (Confidential)', 4, '核心机密，仅高层或特定人员可见');

-- -----------------------------------------------------
-- 表2：职能类别表 (Categories)
-- 对应文档中的“职能维度”和“数据类别维度” (如财务、人事) 
-- -----------------------------------------------------
DROP TABLE IF EXISTS sys_category;
CREATE TABLE sys_category (
  category_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  category_code VARCHAR(20) NOT NULL UNIQUE COMMENT '编码',
  category_name VARCHAR(50) NOT NULL COMMENT '名称',
  description VARCHAR(255) COMMENT '职能描述'
) COMMENT='职能与数据类别表';

-- 初始化职能数据
INSERT INTO sys_category (category_code, category_name, description) VALUES 
('FIN', '财务部', '负责工资、报销等资金数据'),
('HR',  '人事部', '负责员工档案、绩效等数据'),
('DEV', '研发部', '负责源代码、技术文档'),
('GEN', '综合部', '负责公告、行政通知');

-- ==============================================================================
-- 第二部分：主体表 (Subject) - 用户与角色
-- ==============================================================================

-- -----------------------------------------------------
-- 表3：系统用户表 (Subjects)
-- 包含主体标记：敏感等级、职能、信任等级 
-- -----------------------------------------------------
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
  user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号',
  password_hash VARCHAR(100) NOT NULL DEFAULT '123456' COMMENT '密码(实际开发请加密)',
  real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
  
  -- === 主体安全标记 (Subject Labels) ===
  security_level_id INT NOT NULL DEFAULT 1 COMMENT '主体敏感等级 (关联sys_security_level)',
  category_id INT NOT NULL COMMENT '主体所属职能 (关联sys_category)',
  trust_level ENUM('USER', 'ADMIN') DEFAULT 'USER' COMMENT '信任等级：USER=普通用户, ADMIN=管理员',
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- 外键约束
  CONSTRAINT fk_user_level FOREIGN KEY (security_level_id) REFERENCES sys_security_level(level_id),
  CONSTRAINT fk_user_category FOREIGN KEY (category_id) REFERENCES sys_category(category_id)
) COMMENT='主体用户表';

-- 初始化测试用户 (模拟不同权限的主体)
INSERT INTO sys_user (username, real_name, security_level_id, category_id, trust_level) VALUES 
('boss',    '总经理',     4, 1, 'ADMIN'), -- 机密级，财务部(假设挂靠)，管理员
('cfo',     '财务总监',   4, 1, 'USER'),  -- 机密级，财务部
('hr_mgr',  '人事经理',   3, 2, 'USER'),  -- 秘密级，人事部
('dev_lead','技术组长',   3, 3, 'USER'),  -- 秘密级，研发部
('intern',  '实习生',     1, 4, 'USER');  -- 公开级，综合部

-- ==============================================================================
-- 第三部分：客体表 (Object) - 受保护的数据资源
-- ==============================================================================

-- -----------------------------------------------------
-- 表4：薪资信息表 (Objects - 示例1)
-- 演示“行级访问控制”，每行都有安全标记 
-- -----------------------------------------------------
DROP TABLE IF EXISTS data_salary;
CREATE TABLE data_salary (
  data_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_name VARCHAR(50) NOT NULL COMMENT '员工姓名',
  base_salary DECIMAL(10, 2) NOT NULL COMMENT '基本工资',
  bonus DECIMAL(10, 2) DEFAULT 0.00 COMMENT '奖金',
  
  -- === 客体安全标记 (Object Labels) ===
  data_security_level_id INT NOT NULL COMMENT '数据敏感等级',
  data_category_id INT NOT NULL COMMENT '数据所属类别',
  lifecycle_status ENUM('ACTIVE', 'ARCHIVED') DEFAULT 'ACTIVE' COMMENT '生命周期：ACTIVE=活跃, ARCHIVED=归档',
  
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- 外键约束
  CONSTRAINT fk_salary_level FOREIGN KEY (data_security_level_id) REFERENCES sys_security_level(level_id),
  CONSTRAINT fk_salary_category FOREIGN KEY (data_category_id) REFERENCES sys_category(category_id)
) COMMENT='客体资源-薪资表';

-- 初始化测试数据 (不同密级的数据)
INSERT INTO data_salary (employee_name, base_salary, bonus, data_security_level_id, data_category_id, lifecycle_status) VALUES 
('总经理薪资', 50000.00, 20000.00, 4, 1, 'ACTIVE'), -- 机密，财务部
('技术骨干薪资', 25000.00, 5000.00,  3, 1, 'ACTIVE'), -- 秘密，财务部
('普通员工薪资', 8000.00,  1000.00,  2, 1, 'ACTIVE'), -- 内部，财务部
('实习生补贴', 2000.00,  0.00,     1, 1, 'ACTIVE'); -- 公开，财务部

-- -----------------------------------------------------
-- 表5：公司公告表 (Objects - 示例2)
-- -----------------------------------------------------
DROP TABLE IF EXISTS data_notice;
CREATE TABLE data_notice (
  notice_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT,
  
  -- === 客体安全标记 ===
  data_security_level_id INT NOT NULL DEFAULT 1,
  data_category_id INT NOT NULL,
  
  CONSTRAINT fk_notice_level FOREIGN KEY (data_security_level_id) REFERENCES sys_security_level(level_id)
) COMMENT='客体资源-公告表';

INSERT INTO data_notice (title, content, data_security_level_id, data_category_id) VALUES
('关于放假的通知', '全体放假三天...', 1, 4),        -- 公开，综合部
('2026战略规划', '未来三年计划上市...', 4, 4);      -- 机密，综合部

-- ==============================================================================
-- 第四部分：策略与决策（修正版：满足“一对一”E-R关系）
-- ==============================================================================

-- -----------------------------------------------------
-- 表6A：访问策略记录表 (Access Policy Context)
-- 实体含义：记录一次访问请求中，涉及的“策略要素”（当时的主体、客体状态）
-- 对应 E-R 图实体：访问策略
-- -----------------------------------------------------
DROP TABLE IF EXISTS sys_access_policy;
CREATE TABLE sys_access_policy (
  policy_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  
  -- 关联的主体与客体
  subject_user_id INT NOT NULL COMMENT '发起访问的主体ID',
  object_data_id INT NOT NULL COMMENT '受访问的客体ID',
  target_table VARCHAR(50) NOT NULL COMMENT '受访问的表名(如data_salary)',
  
  -- 核心策略要素（保留快照，防止日后用户等级变更导致无法追溯）
  subject_level_snapshot INT NOT NULL COMMENT '当时的主体安全等级权重',
  object_level_snapshot INT NOT NULL COMMENT '当时的客体安全等级权重',
  operation_requested VARCHAR(20) NOT NULL COMMENT '请求的操作：READ/WRITE',
  
  request_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- 外键（可选，为了数据完整性）
  CONSTRAINT fk_policy_user FOREIGN KEY (subject_user_id) REFERENCES sys_user(user_id)
) COMMENT='访问策略记录表(记录比对条件)';

-- -----------------------------------------------------
-- 表6B：访问决策结果表 (Access Decision)
-- 实体含义：基于上述策略，系统给出的最终判定
-- 对应 E-R 图实体：访问决策
-- 关系：与访问策略表为 1:1 关系
-- -----------------------------------------------------
DROP TABLE IF EXISTS sys_access_decision;
CREATE TABLE sys_access_decision (
  decision_id BIGINT NOT NULL PRIMARY KEY COMMENT '主键，直接使用策略ID以保证1:1',
  
  -- 决策结果
  result_code ENUM('ALLOW', 'DENY') NOT NULL COMMENT '决策结果',
  result_message VARCHAR(255) COMMENT '决策说明/拒绝原因',
  decision_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- 建立 1:1 外键关系：decision_id 既是主键也是外键，指向 sys_access_policy(policy_id)
  CONSTRAINT fk_decision_policy FOREIGN KEY (decision_id) REFERENCES sys_access_policy(policy_id) ON DELETE CASCADE
) COMMENT='访问决策结果表';