import { getMediaPosts } from "@/lib/notion";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const databaseId = searchParams.get("db");
    const token = searchParams.get("token");

    if (!databaseId || !token) {
      return NextResponse.json(
        { error: "Missing Notion token or database ID" },
        { status: 400 }
      );
    }

    console.log("Using Token:", token);
    console.log("Using Database ID:", databaseId);

    const posts = await getMediaPosts({ databaseId, token });
    console.log({ posts });

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
