"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Shield,
  Calendar,
  Clock,
  Users,
  Activity,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

/* ── Header ────────────────────────────────────────────────── */

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        padding: scrolled ? "12px 0" : "16px 0",
        background: scrolled ? "rgba(245, 255, 254, 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 4px 20px rgba(18, 49, 46, 0.06)" : "none",
      }}
    >
      <div className="max-w-[1140px] mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">MediSync</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          <button onClick={() => scrollTo("features")} className="px-3.5 py-2 text-[0.95rem] text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
            Features
          </button>
          <button onClick={() => scrollTo("screenshots")} className="px-3.5 py-2 text-[0.95rem] text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
            Product
          </button>
          <button onClick={() => scrollTo("metrics")} className="px-3.5 py-2 text-[0.95rem] text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
            Why MediSync
          </button>
          <button onClick={() => scrollTo("faq")} className="px-3.5 py-2 text-[0.95rem] text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
            FAQ
          </button>
          <button onClick={() => scrollTo("contact")} className="px-3.5 py-2 text-[0.95rem] text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
            Contact
          </button>
          <Link
            href="/login"
            className="ml-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Login
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg px-6 py-4 flex flex-col gap-1">
          <button onClick={() => scrollTo("features")} className="py-2 text-sm text-muted-foreground hover:text-primary text-left">Features</button>
          <button onClick={() => scrollTo("screenshots")} className="py-2 text-sm text-muted-foreground hover:text-primary text-left">Product</button>
          <button onClick={() => scrollTo("metrics")} className="py-2 text-sm text-muted-foreground hover:text-primary text-left">Why MediSync</button>
          <button onClick={() => scrollTo("faq")} className="py-2 text-sm text-muted-foreground hover:text-primary text-left">FAQ</button>
          <button onClick={() => scrollTo("contact")} className="py-2 text-sm text-muted-foreground hover:text-primary text-left">Contact</button>
          <Link href="/login" className="mt-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium text-center">Login</Link>
        </div>
      )}
    </header>
  );
}

/* ── Reveal hook ───────────────────────────────────────────── */

function useReveal(threshold = 0.2) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll("[data-reveal]").forEach((child, i) => {
              setTimeout(() => (child as HTMLElement).style.cssText = "opacity:1;transform:translateY(0)", i * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

const revealStyle: React.CSSProperties = {
  opacity: 0,
  transform: "translateY(20px)",
  transition: "opacity 0.6s ease, transform 0.6s ease",
};

/* ── Hero ──────────────────────────────────────────────────── */

function Hero() {
  const ref = useReveal();

  return (
    <section ref={ref} className="pt-[160px] pb-[120px] max-md:pt-[120px] max-md:pb-[80px]">
      <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-[60px] items-center">
        <div>
          <p data-reveal style={revealStyle} className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-muted-foreground mb-5">
            Clinic Management Platform
          </p>
          <h1 data-reveal style={revealStyle} className="text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[1.08] tracking-tight mb-5">
            Modern clinic management<br />
            for <em className="italic text-primary">patient care</em>
          </h1>
          <p data-reveal style={revealStyle} className="text-[1.1rem] text-muted-foreground max-w-[480px] mb-8 leading-relaxed">
            Appointments, patients, and doctors — all in one place. Built for clinics that want to
            spend less time on admin and more time on care.
          </p>
          <div data-reveal style={revealStyle} className="flex flex-wrap gap-3">
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[0.9375rem] font-medium hover:bg-primary-dark transition-colors"
            >
              Get started
            </button>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full border border-border text-foreground text-[0.9375rem] font-medium hover:bg-card transition-colors"
            >
              Access platform →
            </Link>
          </div>
        </div>

        {/* Dashboard screenshot */}
        <div data-reveal style={revealStyle} className="perspective-[1000px]">
          <div className="rounded-[14px] border border-border overflow-hidden shadow-lg animate-float">
            <img
              src="/screenshots/clinic-dashboard.png"
              alt="MediSync clinic dashboard showing appointments, doctors, and patient overview"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Features ──────────────────────────────────────────────── */

const features = [
  {
    icon: <Calendar className="h-5 w-5" />,
    title: "Smart Scheduling",
    desc: "Automated appointment booking with doctor availability, slot management, and conflict detection built in.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Patient Management",
    desc: "Complete patient records, visit history, and contact information organized per clinic with role-based access.",
  },
  {
    icon: <Activity className="h-5 w-5" />,
    title: "Real-time Dashboard",
    desc: "Live overview of today's appointments, patient counts, and doctor availability at a glance.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Secure & Isolated",
    desc: "Per-clinic data isolation with role-based access controls. Clinic admins, doctors, and patients each see only what they need.",
  },
  {
    icon: <Stethoscope className="h-5 w-5" />,
    title: "Doctor Schedules",
    desc: "Per-day availability, custom slot durations, and working hour management for every doctor across clinics.",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Quick Setup",
    desc: "Register your clinic, add doctors, set schedules, and start booking — all within minutes, not weeks.",
  },
];

function Features() {
  const ref = useReveal(0.15);

  return (
    <section id="features" ref={ref} className="py-[100px] max-md:py-[60px]">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="text-center max-w-[560px] mx-auto mb-14">
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-muted-foreground mb-3">
            Platform
          </p>
          <h2 className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-medium tracking-tight mb-3.5">
            Built for modern clinics
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Everything you need to manage appointments, patients, and staff — without the complexity of legacy systems.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              data-reveal
              style={revealStyle}
              className="bg-card border border-border rounded-xl p-7"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/8 text-primary mb-4">
                {f.icon}
              </div>
              <h3 className="text-[1.05rem] font-medium tracking-tight mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-[0.9rem] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Screenshots ──────────────────────────────────────────── */

const screenshotTabs = [
  {
    id: "clinic",
    label: "Clinic Admin",
    screens: [
      { src: "/screenshots/clinic-dashboard.png", caption: "Dashboard overview with stats and today's appointments" },
      { src: "/screenshots/clinic-appointments.png", caption: "Appointment management with filtering and booking" },
      { src: "/screenshots/clinic-patients.png", caption: "Patient directory with search and records" },
      { src: "/screenshots/clinic-doctors.png", caption: "Doctor roster with specializations and schedules" },
    ],
  },
  {
    id: "doctor",
    label: "Doctor",
    screens: [
      { src: "/screenshots/doctor-dashboard.png", caption: "Doctor dashboard with patient count and daily schedule" },
      { src: "/screenshots/doctor-schedule.png", caption: "Weekly schedule management with slot configuration" },
      { src: "/screenshots/doctor-patients.png", caption: "Patient list with visit history and records" },
    ],
  },
  {
    id: "patient",
    label: "Patient",
    screens: [
      { src: "/screenshots/patient-dashboard.png", caption: "Patient portal with upcoming appointments and clinics" },
      { src: "/screenshots/patient-appointments.png", caption: "Appointment history and upcoming bookings" },
      { src: "/screenshots/patient-records.png", caption: "Medical records with diagnoses and prescriptions" },
    ],
  },
];

function Screenshots() {
  const [activeTab, setActiveTab] = useState("clinic");
  const [activeScreen, setActiveScreen] = useState(0);
  const ref = useReveal(0.1);

  const tab = screenshotTabs.find((t) => t.id === activeTab)!;

  return (
    <section id="screenshots" ref={ref} className="py-[100px] max-md:py-[60px]">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="text-center max-w-[560px] mx-auto mb-14">
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-muted-foreground mb-3">
            Product
          </p>
          <h2 className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-medium tracking-tight mb-3.5">
            See it in action
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Three portals, one platform. Every role gets a tailored experience.
          </p>
        </div>

        {/* Role tabs */}
        <div data-reveal style={revealStyle} className="flex justify-center gap-2 mb-8">
          {screenshotTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setActiveScreen(0); }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Main screenshot */}
        <div data-reveal style={revealStyle} className="rounded-[14px] border border-border overflow-hidden shadow-lg mb-4">
          <img
            src={tab.screens[activeScreen].src}
            alt={tab.screens[activeScreen].caption}
            className="w-full h-auto"
          />
        </div>

        {/* Caption */}
        <p className="text-center text-muted-foreground text-[0.9rem] mb-6">
          {tab.screens[activeScreen].caption}
        </p>

        {/* Thumbnail strip */}
        {tab.screens.length > 1 && (
          <div className="flex justify-center gap-3">
            {tab.screens.map((s, i) => (
              <button
                key={s.src}
                onClick={() => setActiveScreen(i)}
                className={`rounded-lg overflow-hidden border-2 transition-all w-[140px] max-md:w-[100px] ${
                  activeScreen === i
                    ? "border-primary shadow-md"
                    : "border-border opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={s.src}
                  alt={s.caption}
                  className="w-full h-auto"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Metrics ───────────────────────────────────────────────── */

const metrics = [
  { value: "5 min", label: "Clinic setup time" },
  { value: "70%", label: "Less admin work" },
  { value: "99.9%", label: "Platform uptime" },
  { value: "24/7", label: "Online booking" },
];

function Metrics() {
  const ref = useReveal();

  return (
    <section id="metrics" ref={ref} className="py-20">
      <div className="max-w-[1140px] mx-auto px-6">
        <div data-reveal style={revealStyle} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {metrics.map((m, i) => (
            <div key={i} className="text-center p-6 bg-card border border-border rounded-xl">
              <div className="text-[1.8rem] font-medium text-primary tracking-tight mb-1.5">{m.value}</div>
              <div className="text-[0.85rem] text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ───────────────────────────────────────────────────── */

const faqs = [
  {
    q: "How long does setup take?",
    a: "Register your clinic, add doctors, configure schedules, and start booking — all in under 10 minutes. No technical knowledge required.",
  },
  {
    q: "Can I manage multiple doctors?",
    a: "Yes. Add unlimited doctors to your clinic, each with their own schedule, specialization, and availability settings.",
  },
  {
    q: "How does appointment scheduling work?",
    a: "Set each doctor's working hours and slot duration. The system automatically generates available time slots and prevents double-booking.",
  },
  {
    q: "Is patient data secure?",
    a: "All data is isolated per clinic with role-based access. Clinic admins see everything, doctors see their patients, and patients see only their own records.",
  },
  {
    q: "Can doctors access the system?",
    a: "Yes. Doctors get their own login to view their schedule, upcoming appointments, and patient information for their clinic.",
  },
  {
    q: "Is there a mobile version?",
    a: "MediSync is fully responsive and works on any device — desktop, tablet, or phone — through your web browser.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useReveal(0.1);

  return (
    <section id="faq" ref={ref} className="py-[100px] max-md:py-[60px]">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="text-center max-w-[560px] mx-auto mb-14">
          <h2 className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-medium tracking-tight mb-3.5">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Everything clinics ask before getting started with MediSync.
          </p>
        </div>
        <div className="max-w-[760px] mx-auto flex flex-col gap-2.5">
          {faqs.map((item, i) => (
            <div
              key={i}
              data-reveal
              style={revealStyle}
              className="border border-border rounded-xl bg-card overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold hover:bg-muted transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`h-[18px] w-[18px] shrink-0 text-primary transition-transform duration-250 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className="overflow-hidden transition-[max-height] duration-300"
                style={{ maxHeight: open === i ? "300px" : "0" }}
              >
                <p className="px-6 pb-5 text-[0.95rem] text-muted-foreground leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Contact ───────────────────────────────────────────────── */

function Contact() {
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setFormState("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "7e62fd57-0142-47d8-8ec3-d81543507349",
          subject: `MediSync enquiry from ${data.get("name")} (${data.get("clinic")})`,
          name: data.get("name"),
          clinic: data.get("clinic"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFormState("sent");
        form.reset();
        setTimeout(() => setFormState("idle"), 3000);
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  };

  return (
    <section id="contact" className="py-[100px] max-md:py-[60px]">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-20 max-md:gap-12 items-start">
          <div>
            <h2 className="text-[2rem] font-medium tracking-tight mb-4">Get in touch</h2>
            <p className="text-muted-foreground leading-relaxed mb-10 max-w-[400px]">
              Want to set up MediSync for your clinic? Reach out and we&apos;ll help you get started.
            </p>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[0.8rem] text-muted-foreground uppercase tracking-[0.18em]">Email</span>
                <a href="mailto:support@medisync.app" className="text-primary font-medium hover:opacity-80 transition-opacity">
                  support@medisync.app
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[0.8rem] text-muted-foreground uppercase tracking-[0.18em]">Platform</span>
                <Link href="/login" className="text-primary font-medium hover:opacity-80 transition-opacity">
                  medisync.app
                </Link>
              </div>
            </div>
          </div>

          <form
            className="bg-card border border-border rounded-2xl p-9 max-sm:p-6 flex flex-col gap-[18px] shadow-lg"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.85rem] text-muted-foreground">Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  className="bg-background border border-border rounded-lg px-3.5 py-3 text-[0.95rem] outline-none focus:border-primary focus:ring-2 focus:ring-primary/12 transition-all"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.85rem] text-muted-foreground">Clinic name</span>
                <input
                  type="text"
                  name="clinic"
                  required
                  className="bg-background border border-border rounded-lg px-3.5 py-3 text-[0.95rem] outline-none focus:border-primary focus:ring-2 focus:ring-primary/12 transition-all"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.85rem] text-muted-foreground">Email</span>
              <input
                type="email"
                name="email"
                required
                className="bg-background border border-border rounded-lg px-3.5 py-3 text-[0.95rem] outline-none focus:border-primary focus:ring-2 focus:ring-primary/12 transition-all"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.85rem] text-muted-foreground">Message</span>
              <textarea
                rows={4}
                name="message"
                required
                placeholder="Tell us about your clinic..."
                className="bg-background border border-border rounded-lg px-3.5 py-3 text-[0.95rem] outline-none focus:border-primary focus:ring-2 focus:ring-primary/12 transition-all resize-none placeholder:text-muted-foreground/50"
              />
            </label>
            <button
              type="submit"
              disabled={formState === "sending" || formState === "sent"}
              className="w-full mt-1 px-5 py-3 rounded-full bg-primary text-primary-foreground text-[0.9375rem] font-medium hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {(formState === "idle" || formState === "error") && "Send message"}
              {formState === "sending" && "Sending..."}
              {formState === "sent" && "Message sent ✓"}
            </button>
            {formState === "error" && (
              <p className="text-[0.85rem] text-destructive">
                Something went wrong. Please try again or email us directly.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8">
      <div className="max-w-[1140px] mx-auto px-6 flex items-center justify-between max-sm:flex-col max-sm:gap-4 max-sm:text-center">
        <div className="flex items-center gap-5 max-sm:flex-col max-sm:gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Stethoscope className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold">MediSync</span>
          </Link>
          <p className="text-muted-foreground text-[0.85rem]">
            © {new Date().getFullYear()} MediSync. All rights reserved.
          </p>
        </div>
        <div className="flex gap-6">
          <Link href="/login" className="text-muted-foreground text-[0.9rem] hover:text-primary transition-colors">
            Platform Login
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ── Landing Page ──────────────────────────────────────────── */

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-float { animation: none; }
        }
      `}</style>
      <Header />
      <main>
        <Hero />
        <Features />
        <Screenshots />
        <Metrics />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
