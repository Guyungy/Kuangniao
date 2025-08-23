import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // 记录请求开始
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
  
  // 监听响应结束事件
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = getStatusColor(res.statusCode);
    
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} - ` +
      `${statusColor}${res.statusCode}\x1b[0m - ${duration}ms`
    );
  });
  
  next();
};

function getStatusColor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) {
    return '\x1b[32m'; // 绿色
  } else if (statusCode >= 300 && statusCode < 400) {
    return '\x1b[33m'; // 黄色
  } else if (statusCode >= 400 && statusCode < 500) {
    return '\x1b[31m'; // 红色
  } else {
    return '\x1b[35m'; // 紫色
  }
}