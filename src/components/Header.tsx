import Link from "next/link";

export function Header() {
  return <header className="site-header"><div className="header-inner"><Link href="/" className="brand"><span className="brand-mark">P<span>+</span></span><span className="brand-name">Paint <b>&amp; Decor</b><br />Hub</span></Link><nav className="main-nav" aria-label="Main navigation"><Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/blog">Blog</Link><Link href="/contact">Contact</Link></nav><Link className="header-cta" href="/contact">Start a project <span>↗</span></Link></div></header>;
}