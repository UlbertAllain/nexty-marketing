import type { ReactNode } from "react";
import { ExternalLink, Facebook, Globe2, Instagram, Linkedin, Link as LinkIcon } from "lucide-react";
import type { SocialProfile } from "@/modules/leads/types";

type LinkItem = { label: string; href: string; icon: ReactNode };

export function SocialLinks({ social, compact = false }: { social?: SocialProfile; compact?: boolean }) {
  if (!social) return <span className="muted small">Belum ada profil media sosial.</span>;

  const items: LinkItem[] = [
    social.instagramUrl ? { label: social.instagramHandle || "Instagram", href: social.instagramUrl, icon: <Instagram size={15} /> } : null,
    social.tiktokUrl ? { label: social.tiktokHandle || "TikTok", href: social.tiktokUrl, icon: <ExternalLink size={15} /> } : null,
    social.facebookUrl ? { label: "Facebook", href: social.facebookUrl, icon: <Facebook size={15} /> } : null,
    social.linkedinUrl ? { label: "LinkedIn", href: social.linkedinUrl, icon: <Linkedin size={15} /> } : null,
    social.websiteUrl ? { label: "Situs web", href: social.websiteUrl, icon: <Globe2 size={15} /> } : null,
    social.linkInBioUrl ? { label: "Tautan profil", href: social.linkInBioUrl, icon: <LinkIcon size={15} /> } : null,
  ].filter(Boolean) as LinkItem[];

  if (!items.length) return <span className="muted small">Belum ada kanal selain WhatsApp yang terverifikasi.</span>;

  return (
    <div className={compact ? "social-links compact" : "social-links"}>
      {items.map((item) => (
        <a key={`${item.label}-${item.href}`} href={item.href} target="_blank" rel="noreferrer" className="social-link">
          {item.icon}<span>{item.label}</span>
        </a>
      ))}
    </div>
  );
}
