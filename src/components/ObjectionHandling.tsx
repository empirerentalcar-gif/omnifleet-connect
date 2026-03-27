import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const objections = [
  {
    q: '"I already use Turo"',
    a: [
      "You don't need to replace Turo.",
      "Most Zuvio members use it **alongside their existing platforms** to increase bookings and reduce dependence on a single source.",
      "Zuvio simply adds another stream of customers — **one you control.**",
    ],
  },
  {
    q: '"I don\'t want to pay monthly fees"',
    a: [
      "That's exactly why the model is designed this way.",
      "If Zuvio brings you just **1–2 additional bookings per month**, it covers your cost. **Everything beyond that is profit.**",
      "And because there are no contracts, you only continue if it's working.",
    ],
  },
  {
    q: '"I\'m too busy to manage another platform"',
    a: [
      "Zuvio is designed to work alongside your current system.",
      "You receive booking requests, approve or decline them, and communicate directly with customers — **no complicated setup or workflow changes.**",
    ],
  },
  {
    q: '"What if I don\'t get bookings?"',
    a: [
      "That's why we offer **60 days risk-free.**",
      "If it doesn't bring value to your business, you simply don't continue.",
      "There's no long-term commitment.",
    ],
  },
  {
    q: '"I don\'t have a large fleet"',
    a: [
      "You don't need one.",
      "Many independent owners with just a few vehicles use Zuvio to **increase utilization** and generate additional income.",
    ],
  },
];

function renderLine(line: string) {
  const parts = line.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-foreground">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const ObjectionHandling = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
      <div className="container mx-auto px-4 relative z-10 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Still Thinking About It?{" "}
            <span className="text-gradient">Let's Address the Most Common Questions</span>
          </h2>
        </div>

        <Accordion type="multiple" className="space-y-3">
          {objections.map((obj, i) => (
            <AccordionItem
              key={i}
              value={`objection-${i}`}
              className="glass-card rounded-xl border-none px-6"
            >
              <AccordionTrigger className="text-left font-display font-semibold text-foreground text-base md:text-lg hover:no-underline py-5">
                {obj.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="space-y-3 text-muted-foreground text-sm md:text-base leading-relaxed">
                  {obj.a.map((line, j) => (
                    <p key={j}>{renderLine(line)}</p>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="text-center text-lg font-display font-bold text-foreground mt-10 mb-8">
          Zuvio is built to help independent rental owners grow —{" "}
          <span className="text-accent">without giving up control.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="xl" className="group text-base" onClick={() => navigate("/signup")}>
            <span>Start Getting Booking Requests</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="xl"
            className="text-base border-accent/30 hover:bg-accent/10"
            onClick={() => navigate("/signup")}
          >
            Lock My Founding Rate
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ObjectionHandling;
