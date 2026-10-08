import {
  BadgeCheck,
  ClipboardList,
  Compass,
  FolderOpen,
  Handshake,
  MapPin,
  PenLine,
  Search,
  Store,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
};

export type Benefit = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type Step = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const siteConfig = {
  name: "Omega",
  title: "Omega — Connect local businesses with creators",
  description:
    "Omega connects local businesses with creators. Businesses publish collaboration campaigns, and creators discover and apply to work nearby.",
  nav: [
    { href: "#how-it-works", label: "How it works" },
    { href: "#businesses", label: "Businesses" },
    { href: "#creators", label: "Creators" },
  ] satisfies NavItem[],
  steps: [
    {
      title: "Describe the collaboration",
      description:
        "A business sets the place, the story, and what the creator would make.",
      icon: PenLine,
    },
    {
      title: "Discover work nearby",
      description:
        "Creators see collaborations that match their craft and their city.",
      icon: Compass,
    },
    {
      title: "Apply and work together",
      description:
        "A creator applies, and the business chooses the person to collaborate with.",
      icon: Handshake,
    },
  ] satisfies Step[],
  businesses: {
    id: "businesses",
    eyebrow: "For businesses",
    title: "Find creators who already know your neighborhood.",
    description:
      "Omega gives a local business a direct way to brief a collaboration and meet creators whose work fits the brand.",
    benefits: [
      {
        title: "Reach people nearby",
        description:
          "Work with creators who already spend time in the community you serve.",
        icon: Store,
      },
      {
        title: "Brief it once",
        description:
          "Explain the collaboration in one place instead of starting from scratch in every conversation.",
        icon: ClipboardList,
      },
      {
        title: "Choose a better fit",
        description:
          "Compare creators by craft and place before you decide who to work with.",
        icon: BadgeCheck,
      },
    ] satisfies Benefit[],
  },
  creators: {
    id: "creators",
    eyebrow: "For creators",
    title: "Find local collaborations that match your work.",
    description:
      "Omega is where independent creators discover businesses that want a collaborator close to home.",
    benefits: [
      {
        title: "Stay local",
        description:
          "See opportunities from businesses in the places you already know.",
        icon: MapPin,
      },
      {
        title: "Know the ask",
        description:
          "Read what the business needs before you decide to apply.",
        icon: Search,
      },
      {
        title: "Build a local body of work",
        description:
          "Collect collaborations that show how you work with real places and real businesses.",
        icon: FolderOpen,
      },
    ] satisfies Benefit[],
  },
} as const;
