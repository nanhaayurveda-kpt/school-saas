import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("logo");

  const { url } = await put(file.name, file, { access: "public" });

  return NextResponse.json({ url });
}