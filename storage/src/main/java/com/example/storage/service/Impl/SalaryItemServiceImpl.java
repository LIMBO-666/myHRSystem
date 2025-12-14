package com.example.storage.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.common.entity.SalaryItem;
import com.example.storage.mapper.SalaryItemMapper;
import com.example.storage.service.SalaryItemService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 薪酬项目表 Service 实现类
 */
@Service
public class SalaryItemServiceImpl extends ServiceImpl<SalaryItemMapper, SalaryItem> implements SalaryItemService {

    @Override
    public List<SalaryItem> getByItemType(String itemType) {
        LambdaQueryWrapper<SalaryItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryItem::getItemType, itemType);
        return list(wrapper);
    }

    @Override
    public List<SalaryItem> getIncomeItems() {
        return getByItemType("INCOME");
    }

    @Override
    public List<SalaryItem> getDeductionItems() {
        return getByItemType("DEDUCTION");
    }

    @Override
    public SalaryItem getByItemCode(String itemCode) {
        LambdaQueryWrapper<SalaryItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryItem::getItemCode, itemCode)
               .eq(SalaryItem::getStatus, "ACTIVE"); // 只查询激活状态的项目
        return getOne(wrapper);
    }

    @Override
    public SalaryItem getBySortOrder(Integer sortOrder) {
        LambdaQueryWrapper<SalaryItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryItem::getSortOrder, sortOrder)
               .eq(SalaryItem::getStatus, "ACTIVE"); // 只查询激活状态的项目
        return getOne(wrapper);
    }

    @Override
    public SalaryItem getByItemCodeIncludingInactive(String itemCode) {
        LambdaQueryWrapper<SalaryItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryItem::getItemCode, itemCode); // 查询所有状态的项目
        return getOne(wrapper);
    }
}

