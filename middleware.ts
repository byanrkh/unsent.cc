import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function isMaintenanceMode(): Promise<boolean> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_settings?id=eq.1&select=maintenance_mode`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!res.ok) return false;
    const rows = (await res.json()) as { maintenance_mode: boolean }[];
    return rows[0]?.maintenance_mode ?? false;
  } catch {
    return false; // gagal fetch → biarin situs tetap jalan, jangan ikut down
  }
}

export async function middleware(request: NextRequest) {
  // Cuma production yang boleh kena maintenance page. `next dev` selalu
  // set NODE_ENV=development, jadi localhost otomatis lolos tanpa
  // env var tambahan.
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/maintenance")) {
    return NextResponse.next();
  }

  const maintenance = await isMaintenanceMode();

  if (maintenance) {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};