// src/middleware.ts — CORS para todas as rotas /api/*
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const allowed = process.env.FRONTEND_URL ?? 'http://localhost:3000';

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', allowed);
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}

export const config = {
  matcher: '/api/:path*',
};
