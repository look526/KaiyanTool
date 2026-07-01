export type ErrorCategory = 
  | 'network'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'server'
  | 'timeout'
  | 'rate_limit'
  | 'payment'
  | 'unknown';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorSuggestion {
  label: string;
  action?: () => void;
  link?: string;
  linkText?: string;
}

export interface ErrorSolution {
  title: string;
  description: string;
  steps: string[];
  suggestions: ErrorSuggestion[];
}

export interface ErrorInfo {
  category: ErrorCategory;
  severity: ErrorSeverity;
  title: string;
  message: string;
  code?: string;
  details?: string;
  solution?: ErrorSolution;
  retryable?: boolean;
  dismissible?: boolean;
}

const ERROR_SOLUTIONS: Record<string, ErrorSolution> = {
  'NETWORK_ERROR': {
    title: '网络连接失败',
    description: '无法连接到服务器，请检查您的网络连接。',
    steps: [
      '检查网络连接是否正常',
      '尝试刷新页面',
      '检查防火墙或VPN设置',
      '如果使用VPN，尝试切换到其他节点',
    ],
    suggestions: [
      { label: '刷新页面', action: () => window.location.reload() },
      { label: '检查网络状态', link: 'https://www.speedtest.net/', linkText: '测速网站' },
    ],
  },
  'TIMEOUT_ERROR': {
    title: '请求超时',
    description: '服务器响应时间过长，请稍后重试。',
    steps: [
      '等待几秒后重试',
      '检查网络连接速度',
      '如果问题持续，请联系客服',
    ],
    suggestions: [
      { label: '重试操作' },
      { label: '检查网络', link: 'https://www.speedtest.net/', linkText: '测速网站' },
    ],
  },
  'AUTHENTICATION_ERROR': {
    title: '身份验证失败',
    description: '您的登录信息已过期，请重新登录。',
    steps: [
      '点击"退出登录"按钮',
      '使用您的账号密码重新登录',
      '如果忘记密码，请点击"忘记密码"',
    ],
    suggestions: [
      { label: '重新登录', link: '/login', linkText: '前往登录页' },
      { label: '忘记密码？', link: '/forgot-password', linkText: '重置密码' },
    ],
  },
  'AUTHORIZATION_ERROR': {
    title: '权限不足',
    description: '您没有执行此操作的权限。',
    steps: [
      '确认您的账号权限等级',
      '联系项目管理员',
      '申请必要的访问权限',
    ],
    suggestions: [
      { label: '联系管理员' },
      { label: '查看权限说明', link: '/docs/permissions', linkText: '权限文档' },
    ],
  },
  'VALIDATION_ERROR': {
    title: '输入验证失败',
    description: '您输入的信息格式不正确。',
    steps: [
      '检查必填字段是否已填写',
      '确认输入格式是否符合要求',
      '查看字段下方的提示信息',
    ],
    suggestions: [
      { label: '查看表单提示' },
      { label: '联系客服', link: '/support', linkText: '获取帮助' },
    ],
  },
  'NOT_FOUND_ERROR': {
    title: '资源未找到',
    description: '您访问的资源不存在或已被删除。',
    steps: [
      '确认链接地址是否正确',
      '返回上一页',
      '在导航中查找相关内容',
    ],
    suggestions: [
      { label: '返回首页', link: '/', linkText: '前往首页' },
      { label: '搜索内容', link: '/search', linkText: '搜索' },
    ],
  },
  'SERVER_ERROR': {
    title: '服务器错误',
    description: '服务器暂时无法处理您的请求。',
    steps: [
      '等待几分钟后重试',
      '检查我们的服务状态页面',
      '如果问题持续，请联系客服',
    ],
    suggestions: [
      { label: '重试操作' },
      { label: '查看服务状态', link: '/status', linkText: '状态页面' },
      { label: '联系客服', link: '/support', linkText: '获取帮助' },
    ],
  },
  'RATE_LIMIT_ERROR': {
    title: '请求过于频繁',
    description: '您的操作过于频繁，请稍后再试。',
    steps: [
      '等待几分钟后再试',
      '减少操作频率',
      '升级到专业版以获得更高限制',
    ],
    suggestions: [
      { label: '等待1分钟' },
      { label: '查看定价', link: '/pricing', linkText: '升级计划' },
    ],
  },
  'PAYMENT_ERROR': {
    title: '支付失败',
    description: '支付处理过程中出现错误。',
    steps: [
      '确认银行卡信息是否正确',
      '检查卡片余额是否充足',
      '联系银行确认交易状态',
      '尝试使用其他支付方式',
    ],
    suggestions: [
      { label: '重试支付' },
      { label: '更换支付方式' },
      { label: '联系客服', link: '/support', linkText: '获取帮助' },
    ],
  },
  'AI_PROVIDER_ERROR': {
    title: 'AI服务提供商错误',
    description: '无法连接到AI服务提供商。',
    steps: [
      '检查API密钥是否正确',
      '确认服务提供商状态',
      '检查API配额是否充足',
      '尝试测试连接功能',
    ],
    suggestions: [
      { label: '测试连接' },
      { label: '查看文档', link: '/docs/ai-providers', linkText: 'AI配置文档' },
      { label: '联系客服', link: '/support', linkText: '获取帮助' },
    ],
  },
  'AI_MODEL_ERROR': {
    title: 'AI模型错误',
    description: 'AI模型处理请求时出错。',
    steps: [
      '尝试使用其他AI模型',
      '简化输入内容',
      '检查模型是否支持此类型内容',
      '等待几分钟后重试',
    ],
    suggestions: [
      { label: '更换模型' },
      { label: '简化输入' },
      { label: '联系管理员检查后台 AI 模型配置' },
    ],
  },
  'PROJECT_CREATION_ERROR': {
    title: '项目创建失败',
    description: '无法创建新项目。',
    steps: [
      '检查项目名称是否包含非法字符',
      '确认存储空间是否充足',
      '检查是否达到项目数量限制',
      '尝试使用模板创建',
    ],
    suggestions: [
      { label: '重试创建' },
      { label: '使用快速创建', link: '/projects/new', linkText: '快速创建' },
      { label: '查看限制', link: '/settings/account', linkText: '账户设置' },
    ],
  },
  'SCRIPT_SAVE_ERROR': {
    title: '脚本保存失败',
    description: '无法保存脚本内容。',
    steps: [
      '检查网络连接',
      '确认内容长度是否超过限制',
      '检查是否有特殊字符导致问题',
      '尝试手动复制到剪贴板',
    ],
    suggestions: [
      { label: '重试保存' },
      { label: '复制内容' },
      { label: '查看帮助', link: '/docs/script-editor', linkText: '编辑器文档' },
    ],
  },
};

export function categorizeError(error: any): ErrorInfo {
  if (!error) {
    return {
      category: 'unknown',
      severity: 'medium',
      title: '未知错误',
      message: '发生未知错误，请重试。',
      retryable: true,
    };
  }

  const errorMessage = error?.message || error?.toString() || '';
  const errorCode = error?.code || error?.status?.toString();

  if (error?.name === 'NetworkError' || error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return {
      category: 'network',
      severity: 'high',
      title: '网络错误',
      message: errorMessage || '无法连接到服务器，请检查您的网络连接。',
      code: errorCode,
      solution: ERROR_SOLUTIONS.NETWORK_ERROR,
      retryable: true,
    };
  }

  if (error?.name === 'TimeoutError' || errorMessage?.includes('timeout') || errorMessage?.includes('超时')) {
    return {
      category: 'timeout',
      severity: 'medium',
      title: '请求超时',
      message: errorMessage || '服务器响应时间过长，请稍后重试。',
      code: errorCode,
      solution: ERROR_SOLUTIONS.TIMEOUT_ERROR,
      retryable: true,
    };
  }

  if (error?.status === 401 || errorMessage?.includes('unauthorized') || errorMessage?.includes('登录')) {
    return {
      category: 'authentication',
      severity: 'high',
      title: '身份验证失败',
      message: errorMessage || '您的登录信息已过期，请重新登录。',
      code: errorCode,
      solution: ERROR_SOLUTIONS.AUTHENTICATION_ERROR,
      retryable: false,
      dismissible: false,
    };
  }

  if (error?.status === 403 || errorMessage?.includes('forbidden') || errorMessage?.includes('权限')) {
    return {
      category: 'authorization',
      severity: 'high',
      title: '权限不足',
      message: errorMessage || '您没有执行此操作的权限。',
      code: errorCode,
      solution: ERROR_SOLUTIONS.AUTHORIZATION_ERROR,
      retryable: false,
    };
  }

  if (error?.status === 404 || errorMessage?.includes('not found') || errorMessage?.includes('未找到')) {
    return {
      category: 'not_found',
      severity: 'medium',
      title: '资源未找到',
      message: errorMessage || '您访问的资源不存在或已被删除。',
      code: errorCode,
      solution: ERROR_SOLUTIONS.NOT_FOUND_ERROR,
      retryable: false,
    };
  }

  if (error?.status === 400 || errorMessage?.includes('validation') || errorMessage?.includes('验证')) {
    return {
      category: 'validation',
      severity: 'low',
      title: '输入验证失败',
      message: errorMessage || '您输入的信息格式不正确。',
      code: errorCode,
      solution: ERROR_SOLUTIONS.VALIDATION_ERROR,
      retryable: true,
    };
  }

  if (error?.status === 429 || errorMessage?.includes('rate limit') || errorMessage?.includes('过于频繁')) {
    return {
      category: 'rate_limit',
      severity: 'medium',
      title: '请求过于频繁',
      message: errorMessage || '您的操作过于频繁，请稍后再试。',
      code: errorCode,
      solution: ERROR_SOLUTIONS.RATE_LIMIT_ERROR,
      retryable: true,
    };
  }

  if (error?.status === 500 || error?.status === 502 || error?.status === 503) {
    return {
      category: 'server',
      severity: 'critical',
      title: '服务器错误',
      message: errorMessage || '服务器暂时无法处理您的请求。',
      code: errorCode,
      solution: ERROR_SOLUTIONS.SERVER_ERROR,
      retryable: true,
    };
  }

  if (errorMessage?.includes('AI') || errorMessage?.includes('模型')) {
    return {
      category: 'unknown',
      severity: 'medium',
      title: 'AI相关错误',
      message: errorMessage || 'AI处理请求时出错。',
      code: errorCode,
      solution: errorMessage?.includes('provider') ? ERROR_SOLUTIONS.AI_PROVIDER_ERROR : ERROR_SOLUTIONS.AI_MODEL_ERROR,
      retryable: true,
    };
  }

  return {
    category: 'unknown',
    severity: 'medium',
    title: '发生错误',
    message: errorMessage || '发生未知错误，请重试。',
    code: errorCode,
    retryable: true,
  };
}

export function getSeverityColor(severity: ErrorSeverity): string {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626',
  };
  return colors[severity];
}

export function getSeverityIcon(severity: ErrorSeverity): string {
  const icons = {
    low: 'ℹ️',
    medium: '⚠️',
    high: '❌',
    critical: '🔥',
  };
  return icons[severity];
}

export function getSolutionKey(error: any): string | undefined {
  const errorMessage = error?.message || '';
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) return 'NETWORK_ERROR';
  if (errorMessage.includes('timeout') || errorMessage.includes('超时')) return 'TIMEOUT_ERROR';
  if (error?.status === 401 || errorMessage.includes('unauthorized')) return 'AUTHENTICATION_ERROR';
  if (error?.status === 403 || errorMessage.includes('forbidden')) return 'AUTHORIZATION_ERROR';
  if (error?.status === 404 || errorMessage.includes('not found')) return 'NOT_FOUND_ERROR';
  if (error?.status === 400 || errorMessage.includes('validation')) return 'VALIDATION_ERROR';
  if (error?.status === 429 || errorMessage.includes('rate limit')) return 'RATE_LIMIT_ERROR';
  if (error?.status >= 500) return 'SERVER_ERROR';
  if (errorMessage.includes('payment')) return 'PAYMENT_ERROR';
  if (errorMessage.includes('AI') || errorMessage.includes('模型')) {
    return errorMessage.includes('provider') ? 'AI_PROVIDER_ERROR' : 'AI_MODEL_ERROR';
  }
  
  return undefined;
}
