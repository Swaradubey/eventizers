import InvitationCard from "./InvitationCard";

const cards = [
  {
    type: "Birthday",
    title: "Maya's 5th Birthday",
    date: "Sat, June 14",
    time: "2:00 PM",
    host: "Hosted by The Patels",
    gradient: "linear-gradient(135deg, #f9c5d1 0%, #f5a7b8 100%)",
    accentColor: "#e07090",
    emoji: "🎂",
  },
  {
    type: "Wedding",
    title: "Liam & Sofia",
    date: "Sept 21",
    time: "5:00 PM",
    host: "Together with their families",
    venue: "Vineyard Estate",
    gradient: "linear-gradient(135deg, #d4b8e8 0%, #b8a0d4 100%)",
    accentColor: "#9070c0",
    emoji: "💍",
  },
  {
    type: "Corporate",
    title: "Annual Product Launch",
    date: "Oct 3",
    time: "6:30 PM",
    host: "Northwind Technologies",
    venue: "The Innovation Hub",
    gradient: "linear-gradient(135deg, #a8c8e8 0%, #80a8d0 100%)",
    accentColor: "#4080b0",
    emoji: "🚀",
  },
  {
    type: "Dinner Party",
    title: "Supper Club No. 7",
    date: "Fri, May 30",
    time: "7:30 PM",
    host: "Hosted by Chef Amara",
    gradient: "linear-gradient(135deg, #d4c8a0 0%, #c0b080 100%)",
    accentColor: "#907030",
    emoji: "🍽️",
  },
  {
    type: "Baby Shower",
    title: "A Little One is Coming",
    date: "Aug 9",
    time: "12:00 PM",
    host: "Celebrating Baby Reyes",
    venue: "Garden Terrace",
    gradient: "linear-gradient(135deg, #c8e8c8 0%, #a8d0a8 100%)",
    accentColor: "#4a9a4a",
    emoji: "🍼",
  },
  {
    type: "Charity Gala",
    title: "Bright Futures Gala",
    date: "Nov 15",
    time: "8:00 PM",
    host: "Bright Futures Foundation",
    venue: "Grand Ballroom",
    gradient: "linear-gradient(135deg, #c9a84c 0%, #a07820 100%)",
    accentColor: "#a07820",
    emoji: "✨",
  },
  {
    type: "Live Music",
    title: "Rooftop Sessions",
    date: "July 12",
    time: "9:00 PM",
    host: "Presented by Echo Collective",
    venue: "Skyline Loft",
    gradient: "linear-gradient(135deg, #2D1B3D 0%, #4a2a6a 100%)",
    accentColor: "#9970d0",
    emoji: "🎵",
  },
  {
    type: "Anniversary",
    title: "25 Years Together",
    date: "Dec 6",
    time: "6:00 PM",
    host: "Celebrating James & Elena",
    venue: "Lakeside Manor",
    gradient: "linear-gradient(135deg, #e8c4b8 0%, #d0a090 100%)",
    accentColor: "#c06840",
    emoji: "🥂",
  },
];

export default function Templates() {
  return (
    <section id="templates" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
            Hundreds of designs
          </p>
          <h2
            className="font-display text-4xl md:text-5xl font-bold text-[#2D1B3D] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Invitations your guests will love
          </h2>
          <p className="text-[#2D1B3D]/60 text-lg max-w-xl mx-auto">
            Pick a stunning design for any occasion, then customize every detail — or let AI design one for you.
          </p>
        </div>

        {/* Scrollable card row */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {cards.map((card) => (
            <div key={card.title} className="snap-start shrink-0">
              <InvitationCard {...card} />
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#2D1B3D] text-[#2D1B3D] text-sm font-medium hover:bg-[#2D1B3D] hover:text-white transition-all">
            Browse all templates
          </button>
        </div>
      </div>
    </section>
  );
}
