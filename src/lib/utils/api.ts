import { NextResponse } from "next/server";
import type { ApiResponse, PaginatedResponse } from "@/types";

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data } satisfies ApiResponse<T>, { status });
}

export function errorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message } satisfies ApiResponse, { status });
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): NextResponse {
  const response: PaginatedResponse<T> = {
    data: items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
  return NextResponse.json(response);
}
