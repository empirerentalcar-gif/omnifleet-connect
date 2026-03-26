const steps = [
  { num: "01", title: "Create your profile", desc: "Set up your agency or host profile in minutes." },
  { num: "02", title: "List your vehicles", desc: "Add your cars with pricing, photos, and policies." },
  { num: "03", title: "Receive booking requests", desc: "Customers find you and submit reservation requests." },
  { num: "04", title: "Approve or decline", desc: "You choose which bookings to accept." },
  { num: "05", title: "Handle payment your way", desc: "Cash, card, Zelle — your payment, your rules." },
];

const TuroHowItWorks = () => (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
    <div className="container mx-auto px-4 relative max-w-3xl">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          How It <span className="text-gradient">Works</span>
        </h2>
      </div>

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.num} className="glass-card rounded-xl p-6 flex items-start gap-5">
            <span className="text-2xl font-bold text-accent shrink-0">{step.num}</span>
            <div>
              <h3 className="font-bold text-foreground text-lg mb-1">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TuroHowItWorks;
