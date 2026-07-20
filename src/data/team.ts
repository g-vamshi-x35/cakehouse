// Placeholder roster — swap in real names/photos whenever the owner supplies them.
// `name` left blank on purpose rather than inventing fictitious staff names;
// the UI falls back to the role title when no name is set.

export type TeamMember = {
  role: string;
  name?: string;
  photo?: string;
  blurb: string;
};

export const team: TeamMember[] = [
  {
    role: "Owner",
    blurb: "Runs the day-to-day at Cake House — from sourcing ingredients to making sure every order leaves happy.",
  },
  {
    role: "Head Chef",
    blurb: "Leads the kitchen and signs off on every recipe, flavour and finish before it reaches a customer.",
  },
  {
    role: "Baker",
    blurb: "Bakes every sponge fresh each morning and hand-decorates our custom theme cakes.",
  },
  {
    role: "Delivery Partner",
    blurb: "Makes sure your order arrives on time, in one piece, and exactly where it needs to be.",
  },
];
