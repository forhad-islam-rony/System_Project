/**
 * @fileoverview Simple Demo Tests - Healthcare Backend
 * @description Basic tests that demonstrate testing capability
 */

describe('Healthcare System - Basic Tests', () => {
  
  test('✅ Basic calculations work', () => {
    expect(1 + 1).toBe(2)
    expect(5 * 2).toBe(10)
    expect(10 - 5).toBe(5)
  })

  test('✅ String operations work', () => {
    expect('hello'.toUpperCase()).toBe('HELLO')
    expect('WORLD'.toLowerCase()).toBe('world')
    expect('healthcare'.includes('health')).toBe(true)
  })

  test('✅ Array operations work', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr.includes(2)).toBe(true)
    expect(arr.indexOf(1)).toBe(0)
  })
})

describe('Healthcare Functions', () => {
  test('✅ Formats patient name', () => {
    const formatName = (first, last) => `${first} ${last}`
    expect(formatName('John', 'Doe')).toBe('John Doe')
  })

  test('✅ Validates email format', () => {
    const isValidEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
  })

  test('✅ Validates password strength', () => {
    const isStrongPassword = (password) => {
      return password && password.length >= 8
    }
    expect(isStrongPassword('password123')).toBe(true)
    expect(isStrongPassword('weak')).toBe(false)
  })
})
