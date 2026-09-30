"use client";

import Image from "next/image";
import { FounderLink } from "@/components/FounderLink";
import { TrackedLink } from "@/components/TrackedLink";
import { Figures, type Figure } from "./numbers";
import { SceneFrame } from "./SceneFrame";

// Scene 6 (about): Chii, with the photo, the line, and the numbers counting up.
export function FounderScene({
  id,
  eyebrow,
  name,
  role,
  line,
  lineEm,
  body,
  photoAlt,
  link,
  figures,
  note,
}: {
  id?: string;
  eyebrow: string;
  name: string;
  role: string;
  line: string;
  lineEm: string;
  body: string;
  photoAlt: string;
  link: { label: string; href: string | null };
  figures: Figure[];
  note: string;
}) {
  return (
    <SceneFrame id={id}>
      {(p) => (
        <>
          <div className="founder-film">
            <div className="portrait">
              <Image src="/angeline.jpg" alt={photoAlt} fill sizes="200px" style={{ objectFit: "cover", objectPosition: "50% 30%" }} />
            </div>
            <div className="founder-copy">
              <div className="eyebrow">{eyebrow}</div>
              <div className="founder-name"><FounderLink>{name}</FounderLink></div>
              <div className="caption"><FounderLink>{role}</FounderLink></div>
              <div className="mid-line">
                {line} <em>{lineEm}</em>
              </div>
              <div className="body founder-body">{body}</div>
              <TrackedLink href={link.href} className="more">
                <span style={{ color: "var(--accent)" }}>{link.label}</span>
              </TrackedLink>
            </div>
          </div>
          <Figures figures={figures} p={p} from={0.05} />
          <p className="caption">{note}</p>
        </>
      )}
    </SceneFrame>
  );
}
