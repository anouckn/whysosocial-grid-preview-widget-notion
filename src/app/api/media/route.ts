import { getMediaPosts } from "@/lib/notion";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("request", request.headers.get("cache-control"));
    const posts = await getMediaPosts(request);
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
