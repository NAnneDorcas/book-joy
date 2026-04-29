import {
  Bot,
  CalendarClock,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Timer,
} from "lucide-react";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { BookingChat } from "@/components/bookingChat";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
};

const Index = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setServices(data);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-hero text-foreground">
      
      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          
          <Link
            to="/"
            className="flex items-center gap-3 font-display text-lg font-bold tracking-tight"
          >
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
              <Link to="/login">
                <ShieldCheck className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* HERO */}

      <section className="relative mx-auto grid min-h-[calc(100vh-74px)] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        
        <div className="space-y-8">

          <div className="inline-flex items-center gap-2 rounded-full border bg-card/75 px-4 py-2 text-sm font-medium text-muted-foreground shadow-soft backdrop-blur-xl">
            <Bot className="h-4 w-4 text-primary" />
            AI booking automation
          </div>

          <div className="space-y-5">
            <h1 className="font-display text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              Smart AI Appointment Booking
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              BookingAgent Pro helps businesses present services, answer
              customer questions, and streamline appointment booking
              automatically.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            <Button variant="hero" size="lg" asChild>
              <a href="#chat">
                <MessageCircle className="h-5 w-5" />
                Chat with Assistant
              </a>
            </Button>

            <Button variant="glass" size="lg" asChild>
              <Link to="/login">
                <ShieldCheck className="h-5 w-5" />
                Dashboard
              </Link>
            </Button>

          </div>

          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {["24/7 booking", "Clear pricing", "Fast scheduling"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-lg bg-card/70 px-4 py-3 text-sm font-semibold shadow-soft backdrop-blur-xl"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item}
                </div>
              )
            )}
          </div>

        </div>

        {/* HERO CARD */}

        <div className="relative">
          <div className="absolute inset-6 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative rounded-2xl border bg-gradient-panel p-5 shadow-soft backdrop-blur-xl">
            
            <div className="rounded-xl bg-gradient-dark p-5 text-primary-foreground shadow-glow">
              
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">
                    Today’s schedule
                  </p>

                  <h2 className="font-display text-2xl font-bold">
                    Example flow
                  </h2>
                </div>

                <CalendarClock className="h-9 w-9" />
              </div>

              <div className="space-y-3">

                {[
                  ["09:00", "Consultation"],
                  ["10:15", "Massage"],
                  ["12:00", "Facial"],
                ].map(([time, service]) => (
                  <div
                    key={time}
                    className="flex items-center justify-between rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        Customer
                      </p>

                      <p className="text-sm opacity-75">
                        {service}
                      </p>
                    </div>

                    <span className="rounded-md bg-primary-foreground/15 px-3 py-1 text-sm font-bold">
                      {time}
                    </span>
                  </div>
                ))}

              </div>

            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">

              <div className="rounded-xl border bg-card/90 p-4">
                <Timer className="mb-3 h-6 w-6 text-primary" />
                <p className="text-2xl font-bold">5 min</p>
                <p className="text-sm text-muted-foreground">
                  avg booking time
                </p>
              </div>

              <div className="rounded-xl border bg-card/90 p-4">
                <Stethoscope className="mb-3 h-6 w-6 text-primary" />
                <p className="text-2xl font-bold">4.9</p>
                <p className="text-sm text-muted-foreground">
                  satisfaction
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* SERVICES */}

      <section
        id="services"
        className="bg-background px-5 py-16"
      >
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <p className="mb-2 font-semibold text-primary">
              Our Services
            </p>

            <h2 className="font-display text-3xl font-black">
              Available Services
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {services.map((service) => (
              <article
                key={service.id}
                className="rounded-xl border bg-card p-5 shadow-soft"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Stethoscope className="h-6 w-6" />
                </div>

                <h3 className="font-display text-xl font-bold">
                  {service.name}
                </h3>

                <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm">
                  <span className="text-muted-foreground">
                    Price
                  </span>

                  <strong>
                    €{service.price}
                  </strong>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Duration
                  </span>

                  <strong>
                    {service.duration_minutes} min
                  </strong>
                </div>
              </article>
            ))}

          </div>

        </div>
      </section>

      {/* FOOTER */}

      <footer className="border-t bg-surface-deep px-5 py-8 text-primary-foreground">
        <div className="mx-auto max-w-7xl text-sm font-medium">
          Built in AI Web Session 2026, BookingAgent Pro,
          Student: Anne Dorcas Nguewouo,
          Team: TEAM_SLUG
        </div>
      </footer>

      {/* FLOAT BUTTON */}

      <a
        href="#chat"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-4 font-semibold text-primary-foreground shadow-glow"
      >
        <MessageCircle className="h-5 w-5" />
        Chat
      </a>

      {/* REAL CHAT */}

      <BookingChat />

    </main>
  );
};

export default Index;