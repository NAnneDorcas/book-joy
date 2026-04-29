import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  Bot,
  CalendarDays,
  Clock,
  Globe2,
  LayoutDashboard,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

const navItems = [
  { label: "Services", path: "/dashboard/services", icon: LayoutDashboard },
  { label: "Bookings", path: "/dashboard/bookings", icon: CalendarDays },
  { label: "Agent Settings", path: "/dashboard/agent-settings", icon: Settings },
  { label: "Languages", path: "/dashboard/languages", icon: Globe2 },
];

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
};

type Booking = {
  id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  services?: {
    name: string;
  } | null;
};

type AgentSettings = {
  id: number;
  system_prompt: string;
  mode: "info_only" | "full_booking";
  knowledge_base: string;
  opening_hours: string;
  owner_email: string;
};

type ServiceForm = {
  name: string;
  description: string;
  price: string;
  duration_minutes: string;
};

const emptyService: ServiceForm = {
  name: "",
  description: "",
  price: "",
  duration_minutes: "",
};

const DashboardShell = ({
  children,
  onSignOut,
}: {
  children: ReactNode;
  onSignOut: () => void;
}) => (
  <div className="min-h-screen bg-background text-foreground lg:flex">
    <aside className="border-b bg-card px-4 py-4 shadow-soft lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:p-5">
      <div className="mb-6 flex items-center justify-between gap-3 lg:mb-10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display font-black">BookingAgent Pro</p>
            <p className="text-xs text-muted-foreground">Owner dashboard</p>
          </div>
        </div>
      </div>

      <nav className="grid gap-2 sm:grid-cols-4 lg:grid-cols-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <Button variant="glass" className="mt-5 w-full" onClick={onSignOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>

      <div className="mt-8 text-xs text-muted-foreground">
        Built in AI Web Session 2026, BookingAgent Pro, Student: Anne Dorcas
        Nguewouo, Team: TEAM_SLUG
      </div>
    </aside>

    <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {children}
    </section>
  </div>
);

const PageHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="mb-6">
    <p className="mb-2 font-semibold text-primary">BookingAgent Pro</p>
    <h1 className="font-display text-3xl font-black tracking-normal">{title}</h1>
    <p className="mt-2 text-muted-foreground">{subtitle}</p>
  </div>
);

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceForm>(emptyService);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadServices = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) toast.error(error.message);
    else setServices((data as Service[]) ?? []);

    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const saveService = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Service name is required.");
      return;
    }

    const price = Number(form.price);
    const duration = Number(form.duration_minutes);

    if (Number.isNaN(price) || price < 0) {
      toast.error("Price must be a valid number.");
      return;
    }

    if (Number.isNaN(duration) || duration <= 0) {
      toast.error("Duration must be a valid number of minutes.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price,
      duration_minutes: duration,
      is_active: true,
    };

    const { error } = editingId
      ? await supabase.from("services").update(payload).eq("id", editingId)
      : await supabase.from("services").insert(payload);

    if (error) toast.error(error.message);
    else {
      toast.success(editingId ? "Service updated" : "Service added");
      setForm(emptyService);
      setEditingId(null);
      loadServices();
    }
  };

  const editService = (service: Service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description ?? "",
      price: String(service.price),
      duration_minutes: String(service.duration_minutes),
    });
  };

  const deleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return;

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) toast.error(error.message);
    else {
      toast.success("Service deleted");
      loadServices();
    }
  };

  return (
    <div>
      <PageHeader
        title="Services"
        subtitle="Add, edit, and delete services available to customers."
      />

      <div className="grid gap-6 xl:grid-cols-[26rem_1fr]">
        <form
          onSubmit={saveService}
          className="rounded-2xl border bg-card p-5 shadow-soft"
        >
          <h2 className="mb-4 font-display text-xl font-bold">
            {editingId ? "Edit service" : "Add service"}
          </h2>

          <div className="space-y-4">
            <label className="block space-y-2 text-sm font-semibold">
              <span>Name</span>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Signature Massage"
              />
            </label>

            <label className="block space-y-2 text-sm font-semibold">
              <span>Description</span>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Short description of the service"
              />
            </label>

            <label className="block space-y-2 text-sm font-semibold">
              <span>Price</span>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="65"
              />
            </label>

            <label className="block space-y-2 text-sm font-semibold">
              <span>Duration in minutes</span>
              <Input
                type="number"
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm({ ...form, duration_minutes: e.target.value })
                }
                placeholder="60"
              />
            </label>

            <div className="flex gap-2">
              <Button variant="hero" type="submit" className="flex-1">
                <Plus className="h-4 w-4" />
                {editingId ? "Update" : "Add"}
              </Button>

              {editingId && (
                <Button
                  variant="glass"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyService);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="rounded-2xl border bg-card shadow-soft">
          <div className="grid grid-cols-[1fr_7rem_9rem_6rem] gap-3 border-b p-4 text-sm font-bold text-muted-foreground max-md:hidden">
            <span>Service Name</span>
            <span>Price</span>
            <span>Duration</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 p-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading services
            </div>
          ) : services.length === 0 ? (
            <div className="p-6 text-muted-foreground">
              No services yet. Add your first service.
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="grid gap-3 border-b p-4 last:border-b-0 md:grid-cols-[1fr_7rem_9rem_6rem] md:items-center"
              >
                <div>
                  <strong>{service.name}</strong>
                  {service.description && (
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  )}
                </div>

                <span>€{service.price}</span>

                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-primary" />
                  {service.duration_minutes} min
                </span>

                <div className="flex gap-2">
                  <Button
                    variant="glass"
                    size="icon"
                    onClick={() => editService(service)}
                    aria-label="Edit service"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteService(service.id)}
                    aria-label="Delete service"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("bookings")
      .select("*, services(name)")
      .order("start_time", { ascending: true })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setBookings((data as Booking[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="Review appointments created by the AI assistant."
      />

      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        <div className="grid grid-cols-5 gap-3 border-b p-4 text-sm font-bold text-muted-foreground max-md:hidden">
          <span>Customer</span>
          <span>Email</span>
          <span>Service</span>
          <span>Start</span>
          <span>Status</span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 p-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading bookings
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-muted-foreground">
            No bookings yet. New appointments will appear here.
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="grid gap-3 border-b p-4 last:border-b-0 md:grid-cols-5 md:items-center"
            >
              <strong>{booking.customer_name}</strong>
              <span>{booking.customer_email}</span>
              <span>{booking.services?.name ?? booking.service_id}</span>
              <span>{new Date(booking.start_time).toLocaleString()}</span>
              <span>{booking.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AgentSettingsPage = () => {
  const [settings, setSettings] = useState<AgentSettings | null>(null);
  const [prompt, setPrompt] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [fullBooking, setFullBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("agent_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) toast.error(error.message);

      if (data) {
        const settingsData = data as AgentSettings;
        setSettings(settingsData);
        setPrompt(settingsData.system_prompt);
        setKnowledgeBase(settingsData.knowledge_base);
        setOpeningHours(settingsData.opening_hours);
        setOwnerEmail(settingsData.owner_email);
        setFullBooking(settingsData.mode === "full_booking");
      }

      setLoading(false);
    };

    load();
  }, []);

  const save = async () => {
    if (!settings || prompt.trim().length < 20) {
      toast.error("System prompt must be at least 20 characters.");
      return;
    }

    const { error } = await supabase
      .from("agent_settings")
      .update({
        system_prompt: prompt.trim(),
        mode: fullBooking ? "full_booking" : "info_only",
        knowledge_base: knowledgeBase,
        opening_hours: openingHours,
        owner_email: ownerEmail,
      })
      .eq("id", settings.id);

    if (error) toast.error(error.message);
    else toast.success("Agent settings saved");
  };

  return (
    <div>
      <PageHeader
        title="Agent Settings"
        subtitle="Control the assistant’s system prompt, knowledge base, and booking behavior."
      />

      <div className="rounded-2xl border bg-card p-5 shadow-soft">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading settings
          </div>
        ) : (
          <div className="space-y-5">
            <label className="block space-y-2 text-sm font-semibold">
              <span>System Prompt</span>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-40"
                maxLength={2500}
              />
            </label>

            <label className="block space-y-2 text-sm font-semibold">
              <span>Knowledge Base / Business Info</span>
              <Textarea
                value={knowledgeBase}
                onChange={(e) => setKnowledgeBase(e.target.value)}
                className="min-h-32"
              />
            </label>

            <label className="block space-y-2 text-sm font-semibold">
              <span>Opening Hours</span>
              <Input
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
              />
            </label>

            <label className="block space-y-2 text-sm font-semibold">
              <span>Owner Email</span>
              <Input
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
              />
            </label>

            <div className="flex flex-col gap-4 rounded-xl border bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display font-bold">Booking mode</p>
                <p className="text-sm text-muted-foreground">
                  {fullBooking ? "Full Booking Mode" : "Information Only"}
                </p>
              </div>

              <div className="flex items-center gap-3 font-semibold">
                <span>Information Only</span>
                <Switch checked={fullBooking} onCheckedChange={setFullBooking} />
                <span>Full Booking Mode</span>
              </div>
            </div>

            <Button variant="hero" onClick={save}>
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const LanguagesPage = () => {
  const languages = ["English", "Estonian"];

  return (
    <div>
      <PageHeader
        title="Languages"
        subtitle="Language support for multilingual customer conversations."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {languages.map((language) => (
          <div key={language} className="rounded-2xl border bg-card p-5 shadow-soft">
            <Globe2 className="mb-4 h-6 w-6 text-primary" />
            <h2 className="font-display text-xl font-bold">{language}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Available for assistant responses.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user.id ?? null);
        setChecking(false);
      }
    );

    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setChecking(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const routes = useMemo(() => {
    if (!userId) return null;

    return (
      <Routes>
        <Route path="services" element={<ServicesPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="agent-settings" element={<AgentSettingsPage />} />
        <Route path="languages" element={<LanguagesPage />} />
        <Route path="*" element={<Navigate to="services" replace />} />
      </Routes>
    );
  }, [userId]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Checking session
      </div>
    );
  }

  if (!userId) return <Navigate to="/login" replace />;

  return <DashboardShell onSignOut={signOut}>{routes}</DashboardShell>;
};

export default Dashboard;