import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: "Blob storage is not configured." }, { status: 503 });
  const { path } = await params;
  const pathname = path.join("/");
  const result = await get(pathname, { access: "private", token });
  if (!result || result.statusCode !== 200) return NextResponse.json({ error: "Media not found." }, { status: 404 });

  return new Response(result.stream, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": result.headers.get("content-type") || "application/octet-stream",
      "Content-Length": result.headers.get("content-length") || "",
    },
  });
}
