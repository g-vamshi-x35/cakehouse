import Image from "next/image";
import SectionReveal from "@/components/ui/SectionReveal";
import { team } from "@/data/team";

function initialsFor(role: string) {
  return role
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TeamSection() {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="container-px">
        <SectionReveal className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-rose font-semibold tracking-[0.25em] uppercase text-xs mb-3">
            The People Behind The Cakes
          </p>
          <h2 className="font-heading text-3xl md:text-5xl text-brown">Meet Our Team</h2>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <SectionReveal key={member.role} delay={i * 0.08}>
              <div className="bg-cream-light rounded-3xl p-6 text-center h-full hover:-translate-y-1.5 transition-transform duration-300 shadow-sm hover:shadow-lg">
                <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden bg-rose/15 flex items-center justify-center mb-4">
                  {member.photo ? (
                    <Image src={member.photo} alt={member.name ?? member.role} fill className="object-cover" />
                  ) : (
                    <span className="text-2xl font-heading text-rose">{initialsFor(member.role)}</span>
                  )}
                </div>
                <h3 className="font-heading text-lg text-brown">{member.name || member.role}</h3>
                {member.name && <p className="text-xs text-rose font-semibold uppercase tracking-wide mb-2">{member.role}</p>}
                <p className="text-sm text-ink/60 leading-relaxed mt-1">{member.blurb}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
