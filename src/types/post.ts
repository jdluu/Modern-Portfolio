/**
 * Post index/listing shape used by the blog list UI.
 */
export interface PostIndexItem {
  title: string;
  slug: string;
  date: string | null;
  description: string;
  tags: string[];
  draft: boolean;
}
