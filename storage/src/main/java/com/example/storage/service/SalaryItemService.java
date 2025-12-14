package com.example.storage.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.common.entity.SalaryItem;

import java.util.List;

/**
 * 薪酬项目表 Service 接口
 */
public interface SalaryItemService extends IService<SalaryItem> {
    /**
     * 根据项目类型查询薪酬项目列表
     *
     * @param itemType 项目类型：INCOME(收入项), DEDUCTION(扣除项)
     * @return 薪酬项目列表
     */
    List<SalaryItem> getByItemType(String itemType);

    /**
     * 获取所有收入项
     *
     * @return 收入项列表
     */
    List<SalaryItem> getIncomeItems();

    /**
     * 获取所有扣除项
     *
     * @return 扣除项列表
     */
    List<SalaryItem> getDeductionItems();

    /**
     * 根据项目编号查询薪酬项目
     *
     * @param itemCode 项目编号
     * @return 薪酬项目
     */
    SalaryItem getByItemCode(String itemCode);

    /**
     * 根据排序顺序查询薪酬项目
     *
     * @param sortOrder 排序顺序
     * @return 薪酬项目
     */
    SalaryItem getBySortOrder(Integer sortOrder);

    /**
     * 根据项目编号查询薪酬项目（包括已删除的）
     *
     * @param itemCode 项目编号
     * @return 薪酬项目
     */
    SalaryItem getByItemCodeIncludingInactive(String itemCode);
}

