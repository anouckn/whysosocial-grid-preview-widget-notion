import { getMediaPosts } from "@/lib/notion";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const databaseId = searchParams.get("db");
  const token = searchParams.get("token");

  if (!databaseId || !token) {
    return NextResponse.json(
      { error: "Missing database ID or token" },
      { status: 400 }
    );
  }

  try {
    const posts = await getMediaPosts(databaseId, token);
    const response = NextResponse.json(posts);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media posts" },
      { status: 500 }
    );
  }
}
