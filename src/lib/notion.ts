import { Client } from "@notionhq/client";
import { MediaPost } from "@/types/media";

const notion = new Client({
  auth: process.env.NOTION_INTEGERATION_TOKEN,
});

// Notion property types
export interface NotionFile {
  name: string;
  type: "file" | "external";
  file?: { url: string; expiry_time?: string };
  external?: { url: string };
}

export interface NotionFilesProperty {
  id: string;
  type: "files";
  files: NotionFile[];
}

export interface NotionStatusProperty {
  id: string;
  type: "status";
  status: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface NotionDateProperty {
  id: string;
  type: "date";
  date: {
    start: string;
    end: string | null;
    time_zone: string | null;
  } | null;
}

export interface NotionFormulaProperty {
  id: string;
  type: "formula";
  formula: {
    type: "string" | "number" | "boolean" | "date";
    string?: string;
    number?: number;
    boolean?: boolean;
    date?: string;
  };
}

export interface NotionRichText {
  type: "text";
  text: { content: string; link: string | null };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href: string | null;
}

export interface NotionRichTextProperty {
  id: string;
  type: "rich_text";
  rich_text: NotionRichText[];
}

export interface NotionSelectProperty {
  id: string;
  type: "select";
  select: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface NotionMultiSelectProperty {
  id: string;
  type: "multi_select";
  multi_select: {
    id: string;
    name: string;
    color: string;
  }[];
}

export interface NotionTitleProperty {
  id: string;
  type: "title";
  title: NotionRichText[];
}

// All properties together
export interface NotionPageProperties {
  Visuals?: NotionFilesProperty;
  Status?: NotionStatusProperty;
  "Publish date"?: NotionDateProperty;
  Day?: NotionFormulaProperty;
  Caption?: NotionRichTextProperty;
  "Type of content"?: NotionSelectProperty;
  Hashtags?: NotionRichTextProperty;
  Platform?: NotionMultiSelectProperty;
  Subject?: NotionTitleProperty;
  // ...add more as needed
  [key: string]: any; // fallback for unknown properties
}

// Main NotionPage interface
export interface NotionPage {
  object: "page";
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: { object: "user"; id: string };
  last_edited_by: { object: "user"; id: string };
  cover: any | null;
  parent: { type: string; database_id: string };
  archived: boolean;
  in_trash: boolean;
  properties: NotionPageProperties;
  url: string;
  public_url: string | null;
}

export async function getMediaPosts(): Promise<MediaPost[]> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      sorts: [{ property: "Publish date", direction: "descending" }],
    });

    const posts: MediaPost[] = response.results.map(
      (page: any, index: number) => {
        const properties = page.properties;

        if (index === 0) console.log(index, properties);

        // Title fallback
        let title = "Untitled";
        const titleProp = properties.Subject;
        if (titleProp?.type === "title" && titleProp.title.length > 0) {
          title = titleProp.title[0].plain_text;
        }

        // Publish date fallback
        let dateStr =
          properties["Publish date"]?.date?.start || page.created_time;
        const date = new Date(dateStr).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        const attachments = properties.Visuals?.files || [];

        const isVideo = (filename: string) =>
          /\.(mp4|mov|webm|avi)$/i.test(filename);
        const isImage = (filename: string) =>
          /\.(png|jpe?g|gif|webp)$/i.test(filename);

        const videoFiles = attachments.filter((file: any) =>
          isVideo(file.name)
        );
        const imageFiles = attachments.filter((file: any) =>
          isImage(file.name)
        );

        let type: "image" | "video" | "carousel" = "image";
        let videoUrl: string | undefined;
        let images: string[] | undefined;
        let url: string =
          "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800"; // fallback

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
      }
    );

    return posts;
  } catch (error) {
    console.error("Error fetching Notion data:", error);
    return [];
  }
}
