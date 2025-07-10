
import { Client } from "@notionhq/client";
import { MediaPost } from "@/types/media";

// Get URL parameters (if running in browser)
const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
const databaseId = urlParams?.get("db") || process.env.NOTION_DATABASE_ID;
const notionToken = urlParams?.get("token") || process.env.NOTION_INTEGERATION_TOKEN;

// Initialize Notion client with dynamic or fallback token
const notion = new Client({
  auth: notionToken,
});

export async function getMediaPosts(): Promise<MediaPost[]> {
  try {
    const response = await notion.databases.query({
      database_id: databaseId!,
      sorts: [{ property: "Publish date", direction: "descending" }],
    });

    const posts: MediaPost[] = response.results.map((page: any, index: number) => {
      const properties = page.properties;

      if (index === 0) console.log(index, properties);

      let title = "Untitled";
      const titleProp = properties.Subject;
      if (titleProp?.type === "title" && titleProp.title.length > 0) {
        title = titleProp.title[0].plain_text;
      }

      let dateStr = properties["Publish date"]?.date?.start || page.created_time;
      const date = new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const attachments = properties.Visuals?.files || [];

      const isVideo = (filename: string) => /\.(mp4|mov|webm|avi)$/i.test(filename);
      const isImage = (filename: string) => /\.(png|jpe?g|gif|webp)$/i.test(filename);

      const videoFiles = attachments.filter((file: any) => isVideo(file.name));
      const imageFiles = attachments.filter((file: any) => isImage(file.name));

      let type: "image" | "video" | "carousel" = "image";
      let videoUrl: string | undefined;
      let images: string[] | undefined;
      let url: string =
        "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800";

      if (videoFiles.length > 0) {
        type = "video";
        videoUrl = videoFiles[0].file?.url;
        url = videoUrl || url;
      } else if (imageFiles.length > 1) {
        type = "carousel";
        images = imageFiles.map((f: any) => f.file?.url).filter(Boolean);
        url = images?.[0] || url;
      } else if (imageFiles.length === 1) {
        type = "image";
        images = [imageFiles[0].file?.url].filter(Boolean);
        url = images[0] || url;
      }

      return {
        id: page.id,
        type,
        url,
        date,
        title,
        images,
        videoUrl,
      };
    });

    return posts;
  } catch (error) {
    console.error("Error fetching Notion data:", error);
    return [];
  }
}
