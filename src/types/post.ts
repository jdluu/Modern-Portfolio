export interface Link {
 label: string;
 url: string;
}

export interface PostProps {
 title: string;
 date: string | null;
 content: string;
 links: Link[];
 hero: string | null;
}

// Post index/listing shape used by the blog list UI
export interface PostIndexItem {
 title: string;
 slug: string;
 date: string | null;
 description: string;
 tags: string[];
 draft: boolean;
}