"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type Post = { id: string; title: string; excerpt: string; media: string; mediaType: "image" | "video"; category: string; date: string };

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/upload")
      .then((response) => response.json())
      .then((data: { posts?: Post[] }) => setPosts(data.posts || []))
      .finally(() => setLoading(false));
  }, []);

  return <><Header /><main><section className="page-hero"><div className="page-hero-inner"><p className="eyebrow gold">The blog</p><h1>Colour, texture,<br /><em>good ideas.</em></h1></div></section><section className="page-content"><div className="journal-header"><p className="section-copy">Notes on choosing colour, caring for your finish, and creating spaces that feel like your own.</p></div>{loading ? <p className="upload-help">Loading the latest posts...</p> : posts.length === 0 ? <div className="empty-blog"><h2>Fresh ideas are on the way.</h2><p>New stories, finishes, and project notes will appear here soon.</p></div> : <div className="journal-grid">{posts.map((post) => <article className="post-card" key={post.id}><div className="post-image">{post.mediaType === "video" ? <video controls muted playsInline preload="metadata" className="blog-video" aria-label={`Play ${post.title}`}><source src={post.media} type="video/mp4" />Your browser does not support video playback.</video> : <Image src={post.media} alt={post.title} fill sizes="(max-width: 850px) 100vw, 33vw" />}</div><div className="post-meta"><span>{post.category}</span><span>{new Date(post.date).toLocaleDateString()}</span></div><h2 className="post-title">{post.title}</h2><p className="post-excerpt">{post.excerpt}</p></article>)}</div>}</section></main><Footer /></>;
}
