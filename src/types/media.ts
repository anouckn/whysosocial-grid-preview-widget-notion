export interface MediaPost {
  id: string;
  type: 'image' | 'video' | 'carousel';
  // url: string;
  date: string;
  title: string;
  images?: string[];
  videoUrl?: string;
}