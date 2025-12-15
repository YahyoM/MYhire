import type { Profile } from "@/types";

export interface MarketInsight {
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  tags: string[];
}

const FALLBACK_INSIGHTS: MarketInsight[] = [
  {
    title: "Full Stack Engineer",
    company: "Global Tech",
    location: "Remote",
    salaryRange: "$90k – $120k",
    tags: ["React", "Node.js", "TypeScript"],
  },
  {
    title: "Product Designer",
    company: "Crafted UI",
    location: "Berlin, Germany",
    salaryRange: "$70k – $95k",
    tags: ["Design Systems", "Figma", "UX"],
  },
  {
    title: "Data Analyst",
    company: "Insight Labs",
    location: "Austin, USA",
    salaryRange: "$65k – $85k",
    tags: ["SQL", "Python", "Looker"],
  },
  {
    title: "DevOps Engineer",
    company: "ShipFast",
    location: "Toronto, Canada",
    salaryRange: "$100k – $140k",
    tags: ["AWS", "Terraform", "Kubernetes"],
  },
];

const MARKET_API_ENDPOINT =
  process.env.MARKET_INSIGHTS_ENDPOINT ??
  process.env.NEXT_PUBLIC_MARKET_INSIGHTS_ENDPOINT ??
  process.env.NEXT_PUBLIC_MARKET_INSIGHTS_API ??
  null;

interface MarketInsightsResponse {
  insights: MarketInsight[];
  source: "live" | "fallback";
}

export async function getMarketInsights(): Promise<MarketInsightsResponse> {
  if (!MARKET_API_ENDPOINT) {
    return { insights: FALLBACK_INSIGHTS, source: "fallback" };
  }

  try {
    const response = await fetch(MARKET_API_ENDPOINT, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { users?: Array<Record<string, unknown>> };
    const insights = (payload.users ?? [])
      .map<MarketInsight | null>((user) => {
        if (!user || typeof user !== "object") {
          return null;
        }

        const company =
          typeof user.company === "object" && user.company !== null ? (user.company as Record<string, unknown>) : {};
        const companyAddress =
          typeof company.address === "object" && company.address !== null
            ? (company.address as Record<string, unknown>)
            : {};

        const title = typeof company.title === "string" && company.title.length > 0 ? company.title : "Open Role";
        const companyName =
          typeof company.name === "string" && company.name.length > 0 ? company.name : "Global Company";

        const city = typeof companyAddress.city === "string" && companyAddress.city.length > 0 ? companyAddress.city : null;
        const state =
          typeof companyAddress.state === "string" && companyAddress.state.length > 0 ? companyAddress.state : null;
        const locationParts = [city, state].filter((part): part is string => Boolean(part));
        const location = locationParts.length ? locationParts.join(", ") : "Remote";

        const rawTags: Array<string | null> = [
          typeof company.department === "string" && company.department.length > 0 ? company.department : null,
          typeof user.university === "string" && user.university.length > 0 ? user.university : null,
          state,
        ];

        const tags = rawTags
          .filter((tag): tag is string => Boolean(tag))
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
          .filter((tag, index, arr) => arr.indexOf(tag) === index)
          .slice(0, 3);

        if (!tags.length) {
          tags.push("Featured role");
        }

        return {
          title,
          company: companyName,
          location,
          salaryRange: "Competitive",
          tags,
        } satisfies MarketInsight;
      })
      .filter((insight): insight is MarketInsight => insight !== null)
      .slice(0, 6);

    if (!insights.length) {
      throw new Error("Empty response");
    }

    return { insights, source: "live" };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      const message = error instanceof Error ? error.message : "unknown error";
      console.info("Using fallback market insights:", message);
    }
    return { insights: FALLBACK_INSIGHTS, source: "fallback" };
  }
}

export function extractJobseekerProfiles(profiles: Profile[]): Profile[] {
  return profiles.filter((profile) => profile.role === "jobseeker");
}

export function deriveSkillsFromProfiles(profiles: Profile[]): string[] {
  const skills = new Set<string>();
  profiles.forEach((profile) => {
    profile.skills?.forEach((skill) => {
      if (skill) {
        skills.add(skill);
      }
    });
  });
  return Array.from(skills).sort((a, b) => a.localeCompare(b));
}
