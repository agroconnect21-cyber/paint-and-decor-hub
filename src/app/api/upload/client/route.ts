import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { adminCookie, validAdminCookie } from "@/lib/admin-auth";

export const runtime = "nodejs";

function isAdmin(request: Request) {
  const cookie = request.headers.get("cookie")?.split(";").find((item) => item.trim().startsWith(`${adminCookie}=`))?.split("=")[1];
  return validAdminCookie(cookie);
}

export async function POST(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  const body = await request.json();
  return NextResponse.json(await handleUpload({
    request,
    body,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    onBeforeGenerateToken: async (pathname, _clientPayload, multipart) => ({
      allowedContentTypes: ["image/*", "video/*"],
      maximumSizeInBytes: 500 * 1024 * 1024,
      addRandomSuffix: false,
      allowOverwrite: false,
      tokenPayload: JSON.stringify({ pathname, multipart }),
    }),
  }));
}