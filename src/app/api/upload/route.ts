import { del, get, list, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { adminCookie, validAdminCookie } from "@/lib/admin-auth";

export const runtime = "nodejs";

const manifestPath = "content/posts.json";

type SavedPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  media: string;
  mediaPath: string;
  mediaType: "image" | "video";
  filename: string;
  date: string;
};

function token() {
  const value = process.env.BLOB_READ_WRITE_TOKEN;
  if (!value) throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  return value;
}

async function readPosts(): Promise<SavedPost[]> {
  const listResult = await list({ prefix: manifestPath, token: token() });
  const manifest = listResult.blobs.find((blob) => blob.pathname === manifestPath);
  if (!manifest) return [];
  const blobResult = await get(manifestPath, { access: "private", token: token() });
  if (!blobResult || blobResult.statusCode !== 200) return [];
  return await new Response(blobResult.stream).json() as SavedPost[];
}

async function writePosts(posts: SavedPost[]) {
  await put(manifestPath, JSON.stringify(posts, null, 2), { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", token: token() });
}

function text(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

async function saveMedia(file: File) {
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) throw new Error("Only image and video files are supported.");
  const extension = path.extname(file.name).toLowerCase() || (file.type.startsWith("video/") ? ".mp4" : ".jpg");
  const mediaPath = `media/${randomUUID()}${extension}`;
  await put(mediaPath, file, { access: "private", contentType: file.type, multipart: file.type.startsWith("video/"), token: token() });
  return { media: `/api/media/${mediaPath}`, mediaPath, mediaType: file.type.startsWith("video/") ? "video" as const : "image" as const };
}

async function removeMedia(media: string, fallbackUrl?: string) {
  if (media || fallbackUrl) await del(media || fallbackUrl!, { token: token() });
}

function storageError(error: unknown) {
  return error instanceof Error ? error.message : "Storage operation failed.";
}

function isAdmin(request: Request) {
  const cookie = request.headers.get("cookie")?.split(";").find((item) => item.trim().startsWith(`${adminCookie}=`))?.split("=")[1];
  return validAdminCookie(cookie);
}

export async function GET() {
  try {
    return NextResponse.json({ posts: await readPosts() });
  } catch (error) {
    return NextResponse.json({ error: storageError(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const title = text(formData.get("title"));
    const excerpt = text(formData.get("excerpt"));
    const category = text(formData.get("category")) || "Inspiration";
    if (!(file instanceof File)) return NextResponse.json({ error: "A file is required." }, { status: 400 });
    if (!title || !excerpt) return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    const media = await saveMedia(file);
    const post: SavedPost = { id: randomUUID(), title, excerpt, category, ...media, filename: file.name, date: new Date().toISOString() };
    await writePosts([post, ...(await readPosts())]);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: storageError(error) }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  try {
    const formData = await request.formData();
    const id = text(formData.get("id"));
    const title = text(formData.get("title"));
    const excerpt = text(formData.get("excerpt"));
    const category = text(formData.get("category")) || "Inspiration";
    const file = formData.get("file");
    const posts = await readPosts();
    const index = posts.findIndex((post) => post.id === id);
    if (index === -1) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    if (!title || !excerpt) return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    const updated = { ...posts[index], title, excerpt, category };
    if (file instanceof File && file.size > 0) {
      const media = await saveMedia(file);
      await removeMedia(updated.mediaPath, updated.media);
      Object.assign(updated, media, { filename: file.name });
    }
    posts[index] = updated;
    await writePosts(posts);
    return NextResponse.json({ post: updated });
  } catch (error) {
    return NextResponse.json({ error: storageError(error) }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  try {
    const { id } = await request.json() as { id?: string };
    const posts = await readPosts();
    const post = posts.find((item) => item.id === id);
    if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    await removeMedia(post.mediaPath, post.media);
    await writePosts(posts.filter((item) => item.id !== id));
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: storageError(error) }, { status: 503 });
  }
}
