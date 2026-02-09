const MAX_INPUT_LENGTH = 12

Page({
  data: {
    expression: '',
    result: '0',
    activeOperator: '',
    resultFontClass: ''
  },

  _currentInput: '0',
  _previousInput: '',
  _operator: '',
  _shouldResetInput: false,

  _getResultFontClass(text) {
    const len = text.length
    if (len > 12) return 'result-xs'
    if (len > 9) return 'result-sm'
    if (len > 7) return 'result-md'
    return ''
  },

  _formatResult(value) {
    const str = value.toString()
    if (str.length > MAX_INPUT_LENGTH) {
      const num = parseFloat(value)
      if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-10 && num !== 0)) {
        return num.toExponential(6)
      }
      return str.slice(0, MAX_INPUT_LENGTH)
    }
    return str
  },

  handleButtonTap(e) {
    const value = e.currentTarget.dataset.value

    if (this._isNumber(value) || value === '.') {
      this._handleNumberInput(value)
    } else if (this._isOperator(value)) {
      this._handleOperatorInput(value)
    } else if (value === '=') {
      this._handleEquals()
    } else if (value === 'C') {
      this._handleClear()
    } else if (value === '±') {
      this._handleToggleSign()
    } else if (value === '%') {
      this._handlePercentage()
    }
  },

  _isNumber(value) {
    return /^[0-9]$/.test(value)
  },

  _isOperator(value) {
    return ['+', '-', '×', '÷'].includes(value)
  },

  _handleNumberInput(number) {
    let input = this._currentInput

    if (this._shouldResetInput) {
      input = '0'
      this._shouldResetInput = false
    }

    if (number === '.') {
      if (!input.includes('.')) {
        input = input === '' ? '0.' : input + '.'
      }
    } else {
      if (input.replace(/[^0-9]/g, '').length >= MAX_INPUT_LENGTH) return
      input = input === '0' ? number : input + number
    }

    this._currentInput = input
    const display = this._formatResult(input)
    this.setData({
      result: display,
      resultFontClass: this._getResultFontClass(display)
    })
  },

  _handleOperatorInput(operator) {
    const currentInput = this._currentInput
    const previousInput = this._previousInput
    const currentOperator = this._operator

    let updateData = { activeOperator: operator }

    if (previousInput !== '' && currentOperator !== '' && !this._shouldResetInput) {
      const calcResult = this._calculate(previousInput, currentInput, currentOperator)
      if (calcResult === null) {
        this._currentInput = '0'
        this._previousInput = ''
        this._operator = ''
        this._shouldResetInput = false
        const display = '错误'
        this.setData({
          expression: `${previousInput} ${currentOperator} ${currentInput}`,
          result: display,
          activeOperator: '',
          resultFontClass: this._getResultFontClass(display)
        })
        return
      }
      const resultStr = this._formatResult(calcResult)
      this._previousInput = calcResult.toString()
      this._currentInput = '0'
      updateData.result = resultStr
      updateData.expression = `${resultStr} ${operator}`
      updateData.resultFontClass = this._getResultFontClass(resultStr)
    } else {
      const display = this._formatResult(currentInput)
      this._previousInput = currentInput
      this._currentInput = '0'
      updateData.expression = `${display} ${operator}`
    }

    this._operator = operator
    this._shouldResetInput = true
    this.setData(updateData)
  },

  _handleEquals() {
    const previousInput = this._previousInput
    const currentInput = this._currentInput
    const operator = this._operator

    if (previousInput === '' || operator === '') return

    const calcResult = this._calculate(previousInput, currentInput, operator)
    const prevDisplay = this._formatResult(previousInput)
    const currDisplay = this._formatResult(currentInput)

    if (calcResult === null) {
      this._currentInput = '0'
      this._previousInput = ''
      this._operator = ''
      this._shouldResetInput = false
      const display = '错误'
      this.setData({
        expression: `${prevDisplay} ${operator} ${currDisplay}`,
        result: display,
        activeOperator: '',
        resultFontClass: this._getResultFontClass(display)
      })
      return
    }

    const resultStr = this._formatResult(calcResult)
    this._previousInput = ''
    this._currentInput = calcResult.toString()
    this._operator = ''
    this._shouldResetInput = true

    this.setData({
      expression: `${prevDisplay} ${operator} ${currDisplay}`,
      result: resultStr,
      activeOperator: '',
      resultFontClass: this._getResultFontClass(resultStr)
    })
  },

  _handleClear() {
    this._currentInput = '0'
    this._previousInput = ''
    this._operator = ''
    this._shouldResetInput = false

    this.setData({
      expression: '',
      result: '0',
      activeOperator: '',
      resultFontClass: ''
    })
  },

  _handleToggleSign() {
    if (this._currentInput === '0') return

    const newValue = this._currentInput.startsWith('-')
      ? this._currentInput.substring(1)
      : '-' + this._currentInput

    this._currentInput = newValue
    const display = this._formatResult(newValue)
    this.setData({
      result: display,
      resultFontClass: this._getResultFontClass(display)
    })
  },

  _handlePercentage() {
    const value = parseFloat(this._currentInput) / 100
    const fixed = parseFloat(value.toFixed(10))
    this._currentInput = fixed.toString()
    const display = this._formatResult(fixed)
    this.setData({
      result: display,
      resultFontClass: this._getResultFontClass(display)
    })
  },

  _calculate(num1, num2, operator) {
    const n1 = parseFloat(num1)
    const n2 = parseFloat(num2)

    let result
    switch (operator) {
      case '+':
        result = n1 + n2
        break
      case '-':
        result = n1 - n2
        break
      case '×':
        result = n1 * n2
        break
      case '÷':
        if (n2 === 0) return null
        result = n1 / n2
        break
      default:
        return n2
    }

    return parseFloat(result.toFixed(10))
  },

  onShareAppMessage() {
    return {
      title: 'macOS风格计算器',
      path: '/pages/index/index'
    }
  }
})
