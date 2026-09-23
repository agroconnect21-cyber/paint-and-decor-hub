export type Post = { title: string; excerpt: string; media: string; mediaType: "image" | "video"; category: string; date: string };
export const gallery = [
  { src: "/1a.jpg", alt: "Warm textured wall finish" },
  { src: "/1b.jpg", alt: "Contemporary exterior paint finish" },
  { src: "/1c.jpg", alt: "Elegant home facade detail" },
  { src: "/2a.jpg", alt: "Modern home entrance with warm lighting" },
  { src: "/2b.jpg", alt: "Refined architectural paint work" },
  { src: "/3c.jpg", alt: "Clean decorative wall finish" },
  { src: "/4.jpg", alt: "Beautifully finished living space" },
  { src: "/5.jpg", alt: "Premium exterior colour finish" },
  { src: "/6.jpg", alt: "Modern home texture and detail" },
  { src: "/7.jpg", alt: "Paint and decor project detail" },
];
export const posts: Post[] = [];