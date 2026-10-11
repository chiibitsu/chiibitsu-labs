// Structured data for search engines and AI answer engines (schema.org JSON-LD).
// Only facts Chii has confirmed go here (2026-10-02). Descriptions, expertise and location wait for
// Public Identity Canon v1 (vault 00_inbox/2026-10-02-public-identity-canon-v1-draft.md) to be approved.
// The three @ids are permanent: never change them, or search engines see a new person and company.
const SITE = "https://www.chiibitsu.com";
export const IDS = { website: `${SITE}/#website`, organization: `${SITE}/#organization`, person: `${SITE}/angeline#person` };

const person = {
  "@type": "Person",
  "@id": IDS.person,
  name: "Angeline Viray",
  alternateName: ["Chii Viray", "Angeline Chii Viray", "Angeline “Chii” Viray"],
  url: `${SITE}/angeline`,
  image: `${SITE}/angeline.jpg`,
  jobTitle: "Founder, Systems Architect, Behavioral Strategist",
  worksFor: { "@id": IDS.organization },
  sameAs: ["https://www.linkedin.com/in/angelinev"],
};

const organization = {
  "@type": "Organization",
  "@id": IDS.organization,
  name: "Chiibitsu Labs",
  url: SITE,
  email: "labs@chiibitsu.com",
  slogan: "More human, by design.",
  founder: { "@id": IDS.person },
  areaServed: "Worldwide",
  sameAs: ["https://substack.com/@chiibitsulabs"],
};

const website = { "@type": "WebSite", "@id": IDS.website, url: SITE, name: "Chiibitsu Labs", publisher: { "@id": IDS.organization } };

export const homeGraph = { "@context": "https://schema.org", "@graph": [website, organization, person] };

export const profileGraph = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "ProfilePage", "@id": `${SITE}/angeline`, url: `${SITE}/angeline`, mainEntity: { "@id": IDS.person }, isPartOf: { "@id": IDS.website } },
    person,
    organization,
  ],
};
