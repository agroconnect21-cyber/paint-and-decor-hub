"use client";

import { FormEvent } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Contact() {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const subject = `Paint & Decor Hub enquiry: ${fields.project || "General enquiry"}`;
    const body = `Name: ${fields.name}\nEmail: ${fields.email}\nProject: ${fields.project || "General enquiry"}\n\n${fields.message}`;

    event.currentTarget.reset();
    window.location.href = `mailto:Issahakusherif@gmail.com?${new URLSearchParams({ subject, body })}`;
  }

  return <><Header /><main><section className="page-hero"><div className="page-hero-inner"><p className="eyebrow gold">Start a conversation</p><h1>Tell us what<br /><em>you are imagining.</em></h1></div></section><section className="page-content"><div className="contact-grid"><div className="contact-details"><p className="eyebrow">Find us / reach us</p><h2>We make the first step easy.</h2><p>Tell us what you are working on, and we will help you find the right colour, finish, and products.</p><p>Kpaguri Road,<br />behind Sice Wood Work</p><a href="tel:0534579352">053 457 9352</a><a href="https://wa.me/233207570469">WhatsApp: 020 757 0469</a><p>Issahakusherif@gmail.com</p><p>We deliver nationwide.</p></div><form className="contact-form" onSubmit={submit}><input className="field" required name="name" placeholder="Your name" /><input className="field" required type="email" name="email" placeholder="Email address" /><select className="field" name="project"><option>What can we help with?</option><option>Painting and finishes</option><option>Decor products</option><option>Nationwide delivery</option></select><textarea className="field" required name="message" rows={6} placeholder="Tell us a little about your project" /><button className="btn-primary" type="submit">Send enquiry <span>-&gt;</span></button></form></div></section></main><Footer /></>;
}
