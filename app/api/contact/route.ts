// app/api/contact/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    /* ----------  <--  changed section  <--  ---------- */
    // → Use TLS (port 587), which is allowed on Hostinger.
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 587,          // ← switch from 465
      secure: false,      // ← startTLS, not SSL
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    /* ---------------------------------------------- */

    const mailOptions = {
      from: `"Website Contact" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO, // e‑mail address that receives the message
      subject: `New message from ${name}`,
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b><br>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Return a simple JSON payload for the client
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    // Detailed error for debugging – still short‑lived
    console.error("CONTACT_API_ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}