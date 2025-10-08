import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // in seconds
  limit: number;
}

const ipRequestCount = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { interval: 60, limit: 10 }
) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
  const now = Date.now();
  const currentCount = ipRequestCount.get(ip);

  if (!currentCount || now > currentCount.resetTime) {
    ipRequestCount.set(ip, {
      count: 1,
      resetTime: now + config.interval * 1000,
    });
    return {
      isLimited: false,
      remaining: config.limit - 1,
      resetTime: now + config.interval * 1000,
    };
  }

  if (currentCount.count >= config.limit) {
    return {
      isLimited: true,
      remaining: 0,
      resetTime: currentCount.resetTime,
    };
  }

  currentCount.count += 1;
  ipRequestCount.set(ip, currentCount);

  return {
    isLimited: false,
    remaining: config.limit - currentCount.count,
    resetTime: currentCount.resetTime,
  };
} 