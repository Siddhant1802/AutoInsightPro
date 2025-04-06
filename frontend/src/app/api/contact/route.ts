// app/api/contact/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const { name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  // Simulate logging / storing
  console.log("📩 Contact Form Submission:", { name, email, message });

  return NextResponse.json({ success: true });
}
