-- =====================================================
-- 数据变更历史表创建脚本
-- 版本: 1.0
-- 创建时间: 2026-01-01
-- 说明: 用于记录薪资和公告数据的所有变更历史
-- =====================================================

CREATE TABLE IF NOT EXISTS sys_data_history (
    -- 主键
    history_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '历史记录ID',

    -- 关联信息
    source_table VARCHAR(50) NOT NULL COMMENT '源表名称（data_salary/data_notice）',
    source_data_id INT NOT NULL COMMENT '源数据ID',

    -- 版本控制
    version_number INT NOT NULL DEFAULT 1 COMMENT '版本号（同一数据的第N次修改）',

    -- 操作类型
    change_type ENUM('UPDATE', 'DELETE') NOT NULL COMMENT '变更类型：UPDATE=更新, DELETE=删除',

    -- 操作人信息
    operator_user_id INT NOT NULL COMMENT '操作用户ID',

    -- 核心快照字段（JSON存储完整数据）
    data_snapshot JSON NOT NULL COMMENT '数据快照（完整字段JSON）',

    -- 审计字段
    change_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '变更时间',

    -- 索引优化（提升查询性能）
    INDEX idx_source (source_table, source_data_id) COMMENT '按源表和数据ID查询',
    INDEX idx_operator (operator_user_id) COMMENT '按操作人查询',
    INDEX idx_change_time (change_time) COMMENT '按时间排序查询',

    -- 外键约束
    CONSTRAINT fk_operator FOREIGN KEY (operator_user_id)
        REFERENCES sys_user(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据变更历史表';

-- =====================================================
-- 执行说明
-- =====================================================
-- 1. 在 MySQL 客户端执行本脚本
-- 2. 执行命令: source E:\数据库开发\secure-data-access-main\backend\migrations\001_create_data_history.sql
-- 3. 验证: SELECT * FROM sys_data_history LIMIT 1;
-- =====================================================
