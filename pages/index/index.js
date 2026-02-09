// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 显示数据
    expression: '123 + 456',
    result: '579.00',
    currentTime: '15:46',
    batteryLevel: 84,
    batteryColor: '#34C759',
    
    // 计算器状态
    activeOperator: '÷',
    currentInput: '0',
    previousInput: '',
    operator: '',
    shouldResetInput: false,
    
    // 电池动画
    batteryInterval: null,
    timeInterval: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.updateTime();
    this.startBatteryAnimation();
    this.startTimeUpdate();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.stopBatteryAnimation();
    this.stopTimeUpdate();
  },

  /**
   * 更新时间
   */
  updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.setData({
      currentTime: `${hours}:${minutes}`
    });
  },

  /**
   * 开始时间更新
   */
  startTimeUpdate() {
    this.data.timeInterval = setInterval(() => {
      this.updateTime();
    }, 60000); // 每分钟更新一次
  },

  /**
   * 停止时间更新
   */
  stopTimeUpdate() {
    if (this.data.timeInterval) {
      clearInterval(this.data.timeInterval);
    }
  },

  /**
   * 开始电池动画
   */
  startBatteryAnimation() {
    this.data.batteryInterval = setInterval(() => {
      let level = this.data.batteryLevel;
      level = (level + 1) % 101;
      
      // 根据电量改变颜色
      let color = '#34C759'; // 绿色
      if (level > 70) {
        color = '#34C759'; // 绿色
      } else if (level > 30) {
        color = '#FF9500'; // 橙色
      } else {
        color = '#FF3B30'; // 红色
      }
      
      this.setData({
        batteryLevel: level,
        batteryColor: color
      });
    }, 3000);
  },

  /**
   * 停止电池动画
   */
  stopBatteryAnimation() {
    if (this.data.batteryInterval) {
      clearInterval(this.data.batteryInterval);
    }
  },

  /**
   * 处理按钮点击
   */
  handleButtonTap(e) {
    const value = e.currentTarget.dataset.value;
    
    // 添加点击反馈
    const button = e.currentTarget;
    button.setData({
      transform: 'scale(0.95)'
    });
    
    setTimeout(() => {
      button.setData({
        transform: ''
      });
    }, 150);
    
    // 根据按钮类型处理
    if (this.isNumber(value) || value === '.') {
      this.handleNumberInput(value);
    } else if (this.isOperator(value)) {
      this.handleOperatorInput(value);
    } else if (value === '=') {
      this.handleEquals();
    } else if (value === 'C') {
      this.handleClear();
    } else if (value === '±') {
      this.handleToggleSign();
    } else if (value === '%') {
      this.handlePercentage();
    }
  },

  /**
   * 判断是否为数字
   */
  isNumber(value) {
    return /^[0-9]$/.test(value);
  },

  /**
   * 判断是否为操作符
   */
  isOperator(value) {
    return ['+', '-', '×', '÷'].includes(value);
  },

  /**
   * 处理数字输入
   */
  handleNumberInput(number) {
    let currentInput = this.data.currentInput;
    const shouldResetInput = this.data.shouldResetInput;
    
    if (shouldResetInput) {
      currentInput = '';
      this.setData({ shouldResetInput: false });
    }
    
    if (number === '.') {
      if (!currentInput.includes('.')) {
        currentInput = currentInput === '' ? '0.' : currentInput + '.';
      }
    } else {
      currentInput = currentInput === '0' ? number : currentInput + number;
    }
    
    this.setData({
      currentInput: currentInput,
      result: currentInput
    });
  },

  /**
   * 处理操作符输入
   */
  handleOperatorInput(operator) {
    const currentInput = this.data.currentInput;
    const previousInput = this.data.previousInput;
    const currentOperator = this.data.operator;
    
    // 设置当前激活的操作符
    this.setData({
      activeOperator: operator
    });
    
    // 如果有之前的操作符和输入，先计算
    if (previousInput !== '' && currentOperator !== '' && !this.data.shouldResetInput) {
      const result = this.calculate(previousInput, currentInput, currentOperator);
      this.setData({
        previousInput: result.toString(),
        currentInput: '0',
        result: result.toString(),
        expression: `${previousInput} ${currentOperator} ${currentInput}`
      });
    } else {
      this.setData({
        previousInput: currentInput,
        currentInput: '0'
      });
    }
    
    this.setData({
      operator: operator,
      shouldResetInput: true
    });
  },

  /**
   * 处理等号
   */
  handleEquals() {
    const previousInput = this.data.previousInput;
    const currentInput = this.data.currentInput;
    const operator = this.data.operator;
    
    if (previousInput === '' || operator === '') {
      return;
    }
    
    const result = this.calculate(previousInput, currentInput, operator);
    
    this.setData({
      expression: `${previousInput} ${operator} ${currentInput}`,
      result: result.toString(),
      previousInput: '',
      currentInput: result.toString(),
      operator: '',
      activeOperator: '',
      shouldResetInput: true
    });
  },

  /**
   * 处理清除
   */
  handleClear() {
    this.setData({
      expression: '',
      result: '0',
      previousInput: '',
      currentInput: '0',
      operator: '',
      activeOperator: '',
      shouldResetInput: false
    });
  },

  /**
   * 处理正负号切换
   */
  handleToggleSign() {
    const currentInput = this.data.currentInput;
    if (currentInput === '0') return;
    
    const newValue = currentInput.startsWith('-') 
      ? currentInput.substring(1) 
      : '-' + currentInput;
    
    this.setData({
      currentInput: newValue,
      result: newValue
    });
  },

  /**
   * 处理百分比
   */
  handlePercentage() {
    const currentInput = this.data.currentInput;
    const value = parseFloat(currentInput) / 100;
    
    this.setData({
      currentInput: value.toString(),
      result: value.toString()
    });
  },

  /**
   * 计算函数
   */
  calculate(num1, num2, operator) {
    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);
    
    switch (operator) {
      case '+':
        return n1 + n2;
      case '-':
        return n1 - n2;
      case '×':
        return n1 * n2;
      case '÷':
        return n2 === 0 ? 0 : n1 / n2;
      default:
        return n2;
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: 'macOS风格计算器',
      path: '/pages/index/index'
    };
  }
});