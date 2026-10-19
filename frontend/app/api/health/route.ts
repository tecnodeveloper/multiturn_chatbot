import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${backendUrl}/health`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        {
          status: "unhealthy",
          services: { api: false, chart_service: false, data_source: false },
          message: `Backend returned status ${res.status}`,
        },
        { status: 503 }
      );
    }

    const data = await res.json();
    const isHealthy =
      data.status === "healthy" &&
      data.services?.api === true &&
      data.services?.chart_service === true &&
      data.services?.data_source === true;

    return NextResponse.json(data, {
      status: isHealthy ? 200 : 503,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        services: { api: false, chart_service: false, data_source: false },
        message: error?.message || "Backend service unreachable or timed out",
      },
      { status: 503 }
    );
  }
}
