// 可搜索下拉框组件

/**
 * 创建可搜索的下拉框
 * @param {string} selectId - 原始select元素的ID
 * @param {Array} options - 选项数组，格式：[{value: '1', text: '选项1'}, ...]
 * @param {Function} onChange - 值变化回调函数
 * @param {string} placeholder - 占位符文本
 * @returns {Object} 返回控制对象
 */
function createSearchableSelect(selectId, options, onChange, placeholder = '输入关键词搜索或选择') {
    const originalSelect = document.getElementById(selectId);
    if (!originalSelect) {
        console.error('找不到select元素:', selectId);
        return null;
    }
    
    const container = originalSelect.parentElement;
    const isRequired = originalSelect.hasAttribute('required');
    
    // 创建输入框
    const input = document.createElement('input');
    input.type = 'text';
    input.id = selectId + '_input';
    input.className = 'form-control searchable-select-input';
    input.placeholder = placeholder;
    input.autocomplete = 'off';
    input.setAttribute('data-original-id', selectId);
    if (isRequired) {
        input.setAttribute('required', '');
    }
    
    // 创建下拉列表容器
    const dropdown = document.createElement('div');
    dropdown.className = 'searchable-select-dropdown';
    dropdown.id = selectId + '_dropdown';
    dropdown.style.display = 'none';
    
    // 存储选项数据
    let allOptions = options || [];
    let selectedValue = '';
    let selectedText = '';
    
    // 更新选项
    function updateOptions(newOptions) {
        allOptions = newOptions || [];
        // 如果当前有选中值，保持选中状态
        if (selectedValue) {
            const currentOption = allOptions.find(opt => opt.value == selectedValue);
            if (currentOption) {
                input.value = currentOption.text;
            } else {
                input.value = '';
                selectedValue = '';
                selectedText = '';
                if (originalSelect) {
                    originalSelect.value = '';
                }
            }
        }
    }
    
    // 过滤选项
    function filterOptions(keyword) {
        const filtered = keyword 
            ? allOptions.filter(opt => opt.text.includes(keyword))
            : allOptions;
        
        dropdown.innerHTML = '';
        
        if (filtered.length === 0) {
            dropdown.innerHTML = '<div class="searchable-select-no-result">未找到匹配项</div>';
        } else {
            filtered.forEach(opt => {
                const item = document.createElement('div');
                item.className = 'searchable-select-item';
                item.textContent = opt.text;
                item.setAttribute('data-value', opt.value);
                
                // 高亮匹配的关键词
                if (keyword && opt.text.includes(keyword)) {
                    const index = opt.text.indexOf(keyword);
                    const before = opt.text.substring(0, index);
                    const match = opt.text.substring(index, index + keyword.length);
                    const after = opt.text.substring(index + keyword.length);
                    item.innerHTML = `${before}<strong style="color: #667eea;">${match}</strong>${after}`;
                }
                
                item.addEventListener('click', () => {
                    selectOption(opt.value, opt.text);
                });
                
                dropdown.appendChild(item);
            });
        }
    }
    
    // 选择选项
    function selectOption(value, text) {
        selectedValue = value;
        selectedText = text;
        input.value = text;
        dropdown.style.display = 'none';
        
        // 更新原始select的值
        if (originalSelect) {
            originalSelect.value = value;
            // 触发原始select的change事件
            const changeEvent = new Event('change', { bubbles: true });
            originalSelect.dispatchEvent(changeEvent);
        }
        
        // 触发回调函数（延迟执行，确保值已更新）
        if (onChange) {
            setTimeout(() => {
                onChange(value, text);
            }, 0);
        }
        
        // 触发自定义事件
        const event = new CustomEvent('searchableSelectChange', {
            detail: { value, text, selectId }
        });
        input.dispatchEvent(event);
    }
    
    // 输入框事件
    input.addEventListener('input', (e) => {
        const keyword = e.target.value.trim();
        if (keyword) {
            filterOptions(keyword);
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
            selectedValue = '';
            selectedText = '';
            if (originalSelect) {
                originalSelect.value = '';
                const changeEvent = new Event('change', { bubbles: true });
                originalSelect.dispatchEvent(changeEvent);
            }
        }
    });
    
    input.addEventListener('focus', () => {
        if (allOptions.length > 0) {
            filterOptions(input.value.trim());
            dropdown.style.display = 'block';
        }
    });
    
    input.addEventListener('blur', (e) => {
        // 延迟隐藏，以便点击选项时能触发
        setTimeout(() => {
            dropdown.style.display = 'none';
        }, 200);
    });
    
    // 键盘事件
    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.searchable-select-item');
        if (items.length === 0) return;
        
        const currentIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));
        let newIndex = currentIndex;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        } else if (e.key === 'Enter' && currentIndex >= 0) {
            e.preventDefault();
            items[currentIndex].click();
            return;
        }
        
        // 更新选中状态
        items.forEach((item, idx) => {
            if (idx === newIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    });
    
    // 替换原始select
    container.insertBefore(input, originalSelect);
    container.appendChild(dropdown);
    originalSelect.style.display = 'none';
    
    // 初始化选项
    if (allOptions.length > 0) {
        filterOptions('');
    }
    
    // 返回控制对象
    const control = {
        input,
        dropdown,
        updateOptions,
        setValue: (value, text) => {
            selectedValue = value;
            selectedText = text || '';
            input.value = text || '';
            if (originalSelect) {
                originalSelect.value = value;
            }
        },
        getValue: () => {
            // 优先从selectedValue获取值（这是用户实际选择的值）
            // 如果selectedValue为空，再从原始select获取值
            if (selectedValue && selectedValue !== '') {
                return selectedValue;
            }
            return originalSelect ? originalSelect.value : '';
        },
        getText: () => selectedText || input.value,
        clear: () => {
            selectedValue = '';
            selectedText = '';
            input.value = '';
            if (originalSelect) {
                originalSelect.value = '';
                // 触发change事件
                const changeEvent = new Event('change', { bubbles: true });
                originalSelect.dispatchEvent(changeEvent);
            }
            dropdown.style.display = 'none';
            // 触发input事件，确保界面更新
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };
    
    // 存储到全局对象
    if (!window.searchableSelects) {
        window.searchableSelects = {};
    }
    window.searchableSelects[selectId] = control;
    
    return control;
}

