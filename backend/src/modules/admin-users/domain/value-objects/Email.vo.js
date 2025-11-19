/**
 * Email Value Object
 * Immutable value object for email validation
 */
class Email {
  constructor(value) {
    if (!this.isValid(value)) {
      throw new Error('Email không hợp lệ');
    }
    this.value = value.toLowerCase().trim();
  }

  isValid(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toString() {
    return this.value;
  }

  equals(other) {
    return other instanceof Email && this.value === other.value;
  }
}

module.exports = Email;

