import { createBucketClient } from "@cosmicjs/sdk";

const cosmic = createBucketClient({
  bucketSlug: import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG,
  readKey: import.meta.env.PUBLIC_COSMIC_READ_KEY,
});

export interface ProjectCard {
  id: string;
  title: string;
  slug: string;
  metadata: {
    description: string;
    thumbnail: {
      url: string;
    };
    content?: string;
  };
}

export interface ExperienceCard {
  id: string;
  title: string;
  slug: string;
  metadata: {
    description: string;
    thumbnail: {
      url: string;
    };
    content?: string;
    date: string;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  metadata: {
    description?: string;
    thumbnail?: {
      url: string;
    };
  };
}

// Return All Project Card Objects
export async function getAllProjectCards(): Promise<ProjectCard[]> {
  try {
    const data = await cosmic.objects
      .find({
        type: "projectcards",
      })
      .props("slug,title,metadata")
      .depth(1);

    return data.objects;
  } catch (error) {
    console.error("Error fetching project cards:", error);
    return [];
  }
}

// Return All Project Objects
export async function getAllProjects(): Promise<ProjectCard[]> {
  try {
    const data = await cosmic.objects
      .find({
        type: "projects",
      })
      .props("slug,title,metadata")
      .depth(1);

    return data.objects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

// Return All Project Slugs
export async function getAllProjectSlugs(): Promise<{ slug: string }[]> {
  try {
    const data = await cosmic.objects
      .find({
        type: "projects",
      })
      .props("slug")
      .depth(1);

    return data.objects;
  } catch (error) {
    console.error("Error fetching all project slugs:", error);
    return [];
  }
}

// Get Project by Slug
export async function getProjectBySlug(
  slug: string
): Promise<ProjectCard | null> {
  try {
    const data = await cosmic.objects
      .findOne({
        type: "projects",
        slug,
      })
      .props("title,metadata")
      .depth(1);

    return data;
  } catch (error) {
    console.error("Error fetching project by slug:", error);
    return null;
  }
}

// Return All Experience Card Objects
export async function getAllExperienceCards(): Promise<ExperienceCard[]> {
  try {
    const data = await cosmic.objects
      .find({
        type: "experiencecards",
      })
      .props("slug,title,metadata")
      .depth(1);

    return data.objects;
  } catch (error) {
    console.error("Error fetching experience cards:", error);
    return [];
  }
}

// Return All Experience Objects
export async function getAllExperiences(): Promise<ExperienceCard[]> {
  try {
    const data = await cosmic.objects
      .find({
        type: "experiences",
      })
      .props("slug,title,metadata")
      .depth(1);

    return data.objects;
  } catch (error) {
    console.error("Error fetching experience:", error);
    return [];
  }
}

// Return All Experience Slugs
export async function getAllExperienceSlugs(): Promise<{ slug: string }[]> {
  try {
    const data = await cosmic.objects
      .find({
        type: "experiences",
      })
      .props("slug")
      .depth(1);

    return data.objects;
  } catch (error) {
    console.error("Error fetching all experience slugs:", error);
    return [];
  }
}

// Get Experience by Slug
export async function getExperienceBySlug(
  slug: string
): Promise<ExperienceCard | null> {
  try {
    const data = await cosmic.objects
      .findOne({
        type: "experiences",
        slug,
      })
      .props("title,metadata")
      .depth(1);

    return data;
  } catch (error) {
    console.error("Error fetching experience by slug:", error);
    return null;
  }
}

// Return All Post Objects
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const data = await cosmic.objects
      .find({
        type: "posts",
      })
      .props("slug,title,content,metadata")
      .depth(1);

    return data.objects;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// Return All Post Slugs
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  try {
    const data = await cosmic.objects
      .find({
        type: "posts",
      })
      .props("slug")
      .depth(1);

    return data.objects;
  } catch (error) {
    console.error("Error fetching post slugs:", error);
    return [];
  }
}

// Get Post by Slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const data = await cosmic.objects
      .findOne({
        type: "posts",
        slug,
      })
      .props("title,content,metadata")
      .depth(1);

    return data;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export { cosmic };
