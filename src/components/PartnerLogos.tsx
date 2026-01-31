const partners = [
  { id: 1, name: "Partner 1", placeholder: "Add Logo" },
  { id: 2, name: "Partner 2", placeholder: "Add Logo" },
  { id: 3, name: "Partner 3", placeholder: "Add Logo" },
  { id: 4, name: "Partner 4", placeholder: "Add Logo" },
  { id: 5, name: "Partner 5", placeholder: "Add Logo" },
  { id: 6, name: "Partner 6", placeholder: "Add Logo" },
];

const PartnerLogos = () => {
  return (
    <section className="py-16 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
            Trusted by Leading Brands
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {partners.map((partner) => (
            <div 
              key={partner.id}
              className="group flex flex-col items-center"
            >
              {/* Placeholder logo container */}
              <div className="w-32 h-16 rounded-lg bg-muted/50 border border-dashed border-border flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <span className="text-xs text-muted-foreground text-center px-2">
                  {partner.placeholder}
                </span>
              </div>
              <span className="mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerLogos;
