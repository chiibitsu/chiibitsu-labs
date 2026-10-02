import type { Mail } from "@/lib/mail";

const email = "labs@chiibitsu.com";

// The drafts behind every email link. Short prompts, so nobody stares at a blank email.
export const emails = {
  audit: {
    email,
    subject: "Workflow audit request",
    body: "Hi Chii,\n\nThe workflow I'd like you to look at:\n\nWhat breaks when I'm away:\n\nWho else is involved:\n\nMy company and role:\n\nThanks,\n",
  },
  press: {
    email,
    subject: "Press / speaking / partnership inquiry",
    body: "Hi Chii,\n\nI'm reaching out about (press / speaking / a partnership):\n\nWhat I have in mind:\n\nTiming:\n\nMy name, organization and role:\n\nThanks,\n",
  },
  hello: {
    email,
    subject: "Hello from chiibitsu.com",
    body: "Hi Chii,\n\nI found you through chiibitsu.com and wanted to ask about:\n\n\nMy name, company and role:\n\nThanks,\n",
  },
  privacy: {
    email,
    subject: "Privacy request",
    body: "Hi,\n\nMy request (access / correct / delete / other):\n\nDetails:\n\nThe email or name you may hold:\n\nThanks,\n",
  },
} satisfies Record<string, Mail>;
