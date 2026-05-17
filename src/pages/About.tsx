import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Handshake, Scale, Star, Lightbulb, Lock, Globe, Check } from "lucide-react";

const VALUE_ICONS = [Handshake, Scale, Star, Lightbulb, Lock, Globe];

const About = () => {
  const { t } = useTranslation();
  const values = (t('about.values', { returnObjects: true }) as { title: string; desc: string }[]).map(
    (v, i) => ({ ...v, icon: VALUE_ICONS[i] ?? Handshake })
  );
  const differences = t('about.diffs', { returnObjects: true }) as { title: string; desc: string }[];
  const stats = t('about.stats', { returnObjects: true }) as { number: string; label: string }[];
  const story = t('about.story', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t('about.seoTitle')}
        description={t('about.seoDescription')}
        path="/about"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "ZUVIO",
        "url": "https://zuvio.us",
        "logo": "https://zuvio.us/og-image.jpg",
        "description": "Empowering independent car rental agencies and connecting them with customers who value local service and flexibility.",
        "email": "team@zuvio.us",
        "sameAs": []
      }) }} />
{/* Hero */}
      <section className="pt-8 md:pt-32 pb-16 md:pb-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">{t('about.title')}</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-primary">{t('about.missionTitle')}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            {t('about.missionBody')}
          </p>
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-primary-foreground">
            <h3 className="font-display text-2xl font-bold mb-3">{t('about.tagBox')}</h3>
            <p className="text-lg opacity-95">
              {t('about.tagBoxBody')}
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-20 bg-secondary/5">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-primary">{t('about.storyTitle')}</h2>
          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            {story.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-primary text-center">{t('about.valuesTitle')}</h2>
          <p className="text-center text-lg text-muted-foreground mb-12">{t('about.valuesSub')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <div key={i} className="bg-card rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-border/50">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-5">
                  <v.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{v.title}</h3>
                <p className="text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Difference */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-sm border border-border/50">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-10 text-primary text-center">{t('about.diffTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {differences.map((d, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-2">{d.title}</h3>
                    <p className="text-muted-foreground text-sm">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="font-display text-4xl md:text-5xl font-extrabold text-primary mb-2">{s.number}</div>
                <div className="text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">{t('about.joinTitle')}</h2>
          <p className="text-lg text-muted-foreground mb-10">
            {t('about.joinBody')}
          </p>
        </div>
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="font-display text-3xl font-bold mb-4">{t('about.ctaTitle')}</h2>
            <p className="text-lg mb-8 opacity-95">{t('about.ctaBody')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/search" className="bg-background text-primary font-semibold px-8 py-3 rounded-full hover:bg-background/90 transition-colors">
                {t('about.findRental')}
              </Link>
              <Link to="/pricing" className="bg-background text-primary font-semibold px-8 py-3 rounded-full hover:bg-background/90 transition-colors">
                {t('about.becomePartner')}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
