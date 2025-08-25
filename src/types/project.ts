// Type definitions for project pages.
// Mirrors the interfaces defined in src/pages/projects/[slug].astro
// Exported for reuse across the codebase.

export interface Metadata {
  description: string;
  home: {
    image: {
      url: string;
      imgix_url: string;
    };
    imagealt: string;
  };
  logistics: {
    date: string;
    techtitle: string;
    technologies: string;
    tools: string;
  };
  work: {
    role: string;
    responsibilities: { duties: string }[];
  };
  background: {
    description: string;
  };
  problem: {
    description: string;
  };
  solution: {
    title: string;
    description: string;
  };
  process: {
    title: string;
    plan: { steps: string }[];
  };
  prototype: {
    image: {
      url: string;
      imgix_url: string;
    };
    imagealt: string;
  };
  final: {
    description: string;
    image: {
      url: string;
      imgix_url: string;
    };
    imagealt: string;
  };
  reflection: {
    points: { point: string }[];
  };
  source: {
    title: string;
    link: string;
  };
}

export interface PageProps {
  title: string;
  metadata: Metadata;
}