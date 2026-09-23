"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import Link from "next/link";
import { Header } from "@/components/Header";

type SavedPost = { id: string; title: string; excerpt: string; category: string; media: string; mediaPath: string; mediaType: "image" | "video"; filename: string; date: string };
type FormState = { title: string; excerpt: string; category: string; file: File | null };
const emptyForm: FormState = { title: "", excerpt: "", category: "Inspiration", file: null };

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function loadPosts() { const response = await fetch("/api/upload", { cache: "no-store" }); if (response.ok) setPosts((await response.json()).posts); }
  useEffect(() => { fetch("/api/admin/auth").then((response) => response.json()).then((data: { authenticated: boolean }) => { setAuthenticated(data.authenticated); if (data.authenticated) void loadPosts(); }); }, []);
  async function login(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setStatus("Signing in..."); const response = await fetch("/api/admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }); const data = await response.json(); if (!response.ok) { setStatus(data.error || "Sign-in failed."); return; } setAuthenticated(true); setPassword(""); setStatus(""); await loadPosts(); }
  async function logout() { await fetch("/api/admin/auth", { method: "DELETE" }); setAuthenticated(false); }
  function changeField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })); }
  function chooseFile(event: ChangeEvent<HTMLInputElement>) { setForm((current) => ({ ...current, file: event.target.files?.[0] || null })); setProgress(0); }
  function startEdit(post: SavedPost) { setEditingId(post.id); setForm({ title: post.title, excerpt: post.excerpt, category: post.category, file: null }); setStatus(`Editing ${post.title}.`); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function cancelEdit() { abortRef.current?.abort(); setEditingId(null); setForm(emptyForm); setProgress(0); setStatus(""); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.file) { setStatus("Choose an image or video first."); return; }
    setBusy(true); setProgress(0); setStatus("Preparing secure upload...");
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const safeName = form.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const blob = await upload(`media/${crypto.randomUUID()}-${safeName}`, form.file, { access: "private", handleUploadUrl: "/api/upload/client", multipart: form.file.type.startsWith("video/"), contentType: form.file.type, abortSignal: controller.signal, onUploadProgress: ({ percentage }) => { setProgress(Math.round(percentage)); setStatus(`Uploading ${form.file?.type.startsWith("video/") ? "video" : "image"}...`); } });
      setStatus("Finalizing post...");
      const payload = { title: form.title, excerpt: form.excerpt, category: form.category, mediaPath: blob.pathname, mediaType: form.file.type.startsWith("video/") ? "video" : "image", filename: form.file.name };
      const response = await fetch("/api/upload", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The post could not be saved.");
      setPosts((current) => editingId ? current.map((post) => post.id === editingId ? result.post : post) : [result.post, ...current]);
      setStatus(editingId ? "Changes saved. The form is ready for the next post." : "Published successfully. The form is ready for the next post.");
      event.currentTarget.reset(); setEditingId(null); setForm({ ...emptyForm }); setProgress(100);
    } catch (error) {
      setStatus(error instanceof Error && error.name === "AbortError" ? "Upload cancelled." : error instanceof Error ? error.message : "Upload failed.");
    } finally { setBusy(false); abortRef.current = null; }
  }

  function cancelUpload() { abortRef.current?.abort(); }
  async function removePost(id: string) { if (!window.confirm("Delete this post and its media file?")) return; setStatus("Deleting post..."); const response = await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); const result = await response.json(); if (!response.ok) { setStatus(result.error || "The post could not be deleted."); return; } setPosts((current) => current.filter((post) => post.id !== id)); if (editingId === id) cancelEdit(); setStatus("Post deleted."); }

  if (!authenticated) return <div className="admin-shell"><Header /><main className="admin-wrap"><div className="admin-heading"><div><p className="eyebrow">Private area</p><h1 className="section-title">Sign in to<br /><em>content studio.</em></h1></div><Link className="btn-secondary" href="/blog">View blog ↗</Link></div><form className="admin-form admin-login" onSubmit={login}><label>Admin password<input autoFocus required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{status && <div className="status" role="status">{status}</div>}<button className="btn-primary" type="submit">Sign in <span>↗</span></button></form></main></div>;

  return <div className="admin-shell"><Header /><main className="admin-wrap"><div className="admin-heading"><div><p className="eyebrow">Content studio</p><h1 className="section-title">{editingId ? <>Edit<br /><em>the post.</em></> : <>Publish to<br /><em>the blog.</em></>}</h1></div><div className="admin-heading-actions"><Link className="btn-secondary" href="/blog">View blog ↗</Link><button className="btn-secondary" type="button" onClick={() => void logout()}>Sign out</button></div></div><form className="admin-form" onSubmit={submit}><label>Post title<input name="title" required value={form.title} onChange={changeField} placeholder="A title for your story" /></label><label>Category<select name="category" value={form.category} onChange={changeField}><option>Inspiration</option><option>Product notes</option><option>Advice</option><option>Project story</option><option>Colour notes</option><option>Behind the scenes</option></select></label><label>Short description<textarea name="excerpt" required value={form.excerpt} onChange={changeField} rows={4} placeholder="A concise introduction for the blog card" /></label><label>{editingId ? "Replace image or video (optional)" : "Image or video"}<input name="file" required={!editingId} type="file" accept="image/*,video/*" onChange={chooseFile} /></label>{form.file && <div className="file-summary"><strong>{form.file.name}</strong><span>{(form.file.size / 1024 / 1024).toFixed(1)} MB</span></div>}{busy && <div className="upload-progress" aria-live="polite"><div className="upload-progress-label"><span>{status}</span><strong>{progress}%</strong></div><div className="upload-progress-track"><span style={{ width: `${progress}%` }} /></div><button className="btn-secondary" type="button" onClick={cancelUpload}>Cancel upload</button></div>}{status && !busy && <div className="status" role="status">{status}</div>}<p className="upload-help">Direct secure upload with multipart support for large videos. Maximum file size: 500 MB.</p><div className="admin-form-actions"><button className="btn-primary" disabled={busy} type="submit">{busy ? "Uploading..." : editingId ? "Save changes" : "Upload content"} <span>↗</span></button>{editingId && <button className="btn-secondary" type="button" onClick={cancelEdit}>Cancel</button>}</div></form><section className="admin-library"><div className="admin-library-heading"><div><p className="eyebrow">Published media</p><h2>Recent uploads</h2></div><span>{posts.length} {posts.length === 1 ? "item" : "items"}</span></div>{posts.length === 0 ? <p className="upload-help">Your uploaded content will appear here.</p> : <div className="admin-post-grid">{posts.map((post) => <article className="admin-post" key={post.id}><div className="admin-post-media">{post.mediaType === "video" ? <video src={post.media} controls preload="metadata" /> : <img src={post.media} alt={post.title} />}</div><div className="admin-post-copy"><p className="post-meta"><span>{post.category}</span><span>{new Date(post.date).toLocaleDateString()}</span></p><h3>{post.title}</h3><p>{post.excerpt}</p><div className="admin-post-actions"><button className="btn-secondary" type="button" onClick={() => startEdit(post)}>Edit</button><button className="btn-danger" type="button" onClick={() => void removePost(post.id)}>Delete</button></div></div></article>)}</div>}</section></main></div>;
}
