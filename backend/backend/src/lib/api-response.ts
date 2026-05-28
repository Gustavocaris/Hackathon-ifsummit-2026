// src/lib/api-response.ts
import { NextResponse } from 'next/server';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string, errors?: unknown) {
  return NextResponse.json(
    { success: false, message, errors },
    { status: 400 }
  );
}

export function unauthorized(message = 'Não autenticado.') {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

export function forbidden(message = 'Acesso negado.') {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

export function notFound(message = 'Recurso não encontrado.') {
  return NextResponse.json({ success: false, message }, { status: 404 });
}

export function conflict(message: string) {
  return NextResponse.json({ success: false, message }, { status: 409 });
}

export function serverError(message = 'Erro interno do servidor.') {
  return NextResponse.json({ success: false, message }, { status: 500 });
}
