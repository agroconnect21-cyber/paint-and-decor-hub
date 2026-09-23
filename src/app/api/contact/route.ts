import { NextResponse } from "next/server";

const recipient = "Issahakusherif@gmail.com";

export async function POST(request: Request) {
  const body = await request.json() as { name?: string; email?: string; project?: string; message?: string };
  if (!body.name || !body.email || !body.message) return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Email delivery is not configured yet. Add RESEND_API_KEY in Vercel." }, { status: 503 });
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: "Paint & Decor Hub <onboarding@resend.dev>", to: [recipient], reply_to: body.email, subject: `New Paint & Decor Hub enquiry: ${body.project || "General enquiry"}`, text: `Name: ${body.name}\nEmail: ${body.email}\nProject: ${body.project || "General enquiry"}\n\n${body.message}` }) });
  if (!response.ok) return NextResponse.json({ error: "Email delivery failed. Please try again or call us." }, { status: 502 });
  return NextResponse.json({ sent: true });
}
