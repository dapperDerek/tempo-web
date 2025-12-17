import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Get the origin from request or use env variable
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    process.env.CORS_ORIGIN || "http://localhost:8081",
    "http://localhost:3000",
  ];

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
