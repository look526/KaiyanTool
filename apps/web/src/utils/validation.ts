export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePasswordStrength = (password: string): {
  score: number;
  feedback: string;
} => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length < 8) {
    feedback.push('密码至少8位');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('需要包含大写字母');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('需要包含小写字母');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('需要包含数字');
  } else {
    score += 1;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('需要包含特殊字符');
  } else {
    score += 1;
  }

  return {
    score: score / 5,
    feedback: feedback.join('; '),
  };
};

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = '邮箱不能为空';
  } else if (!validateEmail(email)) {
    errors.email = '邮箱格式不正确';
  }

  if (!password) {
    errors.password = '密码不能为空';
  } else if (password.length < 8) {
    errors.password = '密码至少8位';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegisterForm = (name: string, email: string, password: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!name) {
    errors.name = '用户名不能为空';
  } else if (name.length < 2) {
    errors.name = '用户名至少2位';
  } else if (name.length > 50) {
    errors.name = '用户名最多50位';
  }

  if (!email) {
    errors.email = '邮箱不能为空';
  } else if (!validateEmail(email)) {
    errors.email = '邮箱格式不正确';
  }

  if (!password) {
    errors.password = '密码不能为空';
  } else if (password.length < 8) {
    errors.password = '密码至少8位';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = '密码必须包含至少1个大写字母';
  } else if (!/[a-z]/.test(password)) {
    errors.password = '密码必须包含至少1个小写字母';
  } else if (!/[0-9]/.test(password)) {
    errors.password = '密码必须包含至少1个数字';
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    errors.password = '密码必须包含至少1个特殊字符';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
