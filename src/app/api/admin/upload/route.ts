import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Dedicated Admin Image & Media Upload Route
 * Uploads directly to Supabase Storage 'media' bucket using service role credentials
 * Supports any file size up to 50MB, returning a fast, permanent public CDN URL.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "landing";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided for upload" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const fileExt = file.name.split(".").pop() || "jpg";
    const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;
    const filePath = `${folder}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from("media")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
    });
  } catch (err: any) {
    console.error("Upload handler exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
