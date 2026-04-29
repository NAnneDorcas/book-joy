import { Bot, CalendarClock, CheckCircle2, MessageCircle, ShieldCheck, Sparkles, Stethoscope, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const publicServices = [
  { name: "Dental Consultation", price: "$75", duration: "30 min" },
  { name: "Teeth Cleaning", price: "$120", duration: "45 min" },
  { name: "Whitening Session", price: "$220", duration: "60 min" },
  { name: "Emergency Dental Care", price: "$150", duration: "40 min" },
];

const Index = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-gradient-hero text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3 font-display text-lg font-bold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow">
              <Sparkles className="h-5 w-5" />
            </span>
            BookingAgent Pro
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <a href="#services">Services</a>
            </Button>
            <Button variant="glass" asChild>
              <Link to="/login">Dashboard</Link>
            </Button>
          </div>
        </nav>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-74px)] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/75 px-4 py-2 text-sm font-medium text-muted-foreground shadow-soft backdrop-blur-xl">
            <Bot className="h-4 w-4 text-primary" />
            AI booking automation for dental clinics
          </div>
          <div className="space-y-5">
            <h1 className="font-display text-4xl font-black leading-tight tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              Smart AI Appointment Booking for Modern Clinics
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              BookingAgent Pro helps dental clinics present services, answer patient questions, and streamline appointment booking for consultations, cleanings, whitening, and urgent dental care.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="hero" size="lg" asChild>
              <a href="#chat"><MessageCircle className="h-5 w-5" /> Chat with Assistant</a>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <Link to="/login"><ShieldCheck className="h-5 w-5" /> Clinic Dashboard</Link>
            </Button>
          </div>
          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {["24/7 intake", "Clear pricing", "Fast scheduling"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-lg bg-card/70 px-4 py-3 text-sm font-semibold shadow-soft backdrop-blur-xl">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-6 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative rounded-2xl border bg-gradient-panel p-5 shadow-soft backdrop-blur-xl animate-float motion-reduce:animate-none">
            <div className="rounded-xl bg-gradient-dark p-5 text-primary-foreground shadow-glow">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Today’s schedule</p>
                  <h2 className="font-display text-2xl font-bold">Clinic flow</h2>
                </div>
                <CalendarClock className="h-9 w-9" />
              </div>
              <div className="space-y-3">
                {[
                  ["09:00", "Cleaning", "Maya Johnson"],
                  ["10:15", "Consultation", "David Chen"],
                  ["12:00", "Whitening", "Amara Silva"],
                ].map(([time, service, name]) => (
                  <div key={time} className="flex items-center justify-between rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur-xl">
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="text-sm opacity-75">{service}</p>
                    </div>
                    <span className="rounded-md bg-primary-foreground/15 px-3 py-1 text-sm font-bold">{time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl border bg-card/90 p-4">
                <Timer className="mb-3 h-6 w-6 text-primary" />
                <p className="text-2xl font-bold">8 min</p>
                <p className="text-sm text-muted-foreground">avg. booking time</p>
              </div>
              <div className="rounded-xl border bg-card/90 p-4">
                <Stethoscope className="mb-3 h-6 w-6 text-primary" />
                <p className="text-2xl font-bold">4.9</p>
                <p className="text-sm text-muted-foreground">patient clarity score</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="bg-background px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-2 font-semibold text-primary">Transparent dental care</p>
              <h2 className="font-display text-3xl font-black tracking-normal">Our Services</h2>
            </div>
            <p className="max-w-xl text-muted-foreground">Patients can quickly compare service names, pricing, and duration before chatting with the AI assistant.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {publicServices.map((service) => (
              <article key={service.name} className="rounded-xl border bg-card p-5 shadow-soft transition-transform hover:-translate-y-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold">{service.name}</h3>
                <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <strong>{service.price}</strong>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <strong>{service.duration}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t bg-surface-deep px-5 py-8 text-primary-foreground">
        <div className="mx-auto max-w-7xl text-sm font-medium">
          Built in AI Web Session 2026, BookingAgent Pro, Student: Anne Dorcas Nguewouo, Team: TEAM_SLUG
        </div>
      </footer>

      <a href="#chat" className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-4 font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <MessageCircle className="h-5 w-5" /> Chat with Assistant
      </a>

      <div id="chat" className="fixed bottom-24 right-6 z-30 w-[min(22rem,calc(100vw-3rem))] rounded-2xl border bg-card p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent animate-pulseSoft motion-reduce:animate-none" />
          </span>
          <div>
            <p className="font-display font-bold">AI Assistant</p>
            <p className="text-xs text-muted-foreground">Placeholder widget</p>
          </div>
        </div>
        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          Hello, I can help patients choose a dental service and prepare an appointment request.
        </div>
      </div>
    </main>
  );
};

export default Index;
