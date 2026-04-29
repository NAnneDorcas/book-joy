import { useEffect, useMemo, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Bot, CalendarDays, Clock, Globe2, LayoutDashboard, Loader2, LogOut, Pencil, Plus, Save, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const navItems = [
  { label: "Services", path: "/dashboard/services", icon: LayoutDashboard },
  { label: "Bookings", path: "/dashboard/bookings", icon: CalendarDays },
  { label: "Agent Settings", path: "/dashboard/agent-settings", icon: Settings },
  { label: "Languages", path: "/dashboard/languages", icon: Globe2 },
];

type Service = Tables<"clinic_services">;
type Booking = Tables<"clinic_bookings">;
type AgentSettings = Tables<"agent_settings">;

type ServiceForm = { name: string; price: string; duration: string };

const emptyService: ServiceForm = { name: "", price: "", duration: "" };

const validText = (value: string, max = 120) => value.trim().length > 0 && value.trim().length <= max;

const DashboardShell = ({ children, onSignOut }: { children: React.ReactNode; onSignOut: () => void }) => (
  <div className="min-h-screen bg-background text-foreground lg:flex">
    <aside className="border-b bg-card px-4 py-4 shadow-soft lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:p-5">
      <div className="mb-6 flex items-center justify-between gap-3 lg:mb-10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display font-black">BookingAgent Pro</p>
            <p className="text-xs text-muted-foreground">Clinic dashboard</p>
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
                isActive ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
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
    </aside>
    <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</section>
  </div>
);

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-6">
    <p className="mb-2 font-semibold text-primary">BookingAgent Pro</p>
    <h1 className="font-display text-3xl font-black tracking-normal">{title}</h1>
    <p className="mt-2 text-muted-foreground">{subtitle}</p>
  </div>
);

const ServicesPage = ({ userId }: { userId: string }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceForm>(emptyService);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadServices = async () => {
    const { data, error } = await supabase.from("clinic_services").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setServices(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const saveService = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validText(form.name) || !validText(form.price, 40) || !validText(form.duration, 40)) {
      toast.error("Complete all service fields with valid lengths.");
      return;
    }

    const payload = { name: form.name.trim(), price: form.price.trim(), duration: form.duration.trim() };
    const { error } = editingId
      ? await supabase.from("clinic_services").update(payload).eq("id", editingId)
      : await supabase.from("clinic_services").insert({ ...payload, user_id: userId });

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
    setForm({ name: service.name, price: service.price, duration: service.duration });
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase.from("clinic_services").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Service deleted");
      loadServices();
    }
  };

  return (
    <div>
      <PageHeader title="Services" subtitle="Add, edit, and delete dental services available to patients." />
      <div className="grid gap-6 xl:grid-cols-[26rem_1fr]">
        <form onSubmit={saveService} className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="mb-4 font-display text-xl font-bold">{editingId ? "Edit service" : "Add service"}</h2>
          <div className="space-y-4">
            <label className="block space-y-2 text-sm font-semibold">
              <span>Name</span>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Teeth Cleaning" maxLength={120} />
            </label>
            <label className="block space-y-2 text-sm font-semibold">
              <span>Price</span>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="$120" maxLength={40} />
            </label>
            <label className="block space-y-2 text-sm font-semibold">
              <span>Duration</span>
              <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="45 min" maxLength={40} />
            </label>
            <div className="flex gap-2">
              <Button variant="hero" type="submit" className="flex-1">
                <Plus className="h-4 w-4" /> {editingId ? "Update" : "Add"}
              </Button>
              {editingId && (
                <Button variant="glass" type="button" onClick={() => { setEditingId(null); setForm(emptyService); }}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="rounded-2xl border bg-card shadow-soft">
          <div className="grid grid-cols-[1fr_7rem_7rem_6rem] gap-3 border-b p-4 text-sm font-bold text-muted-foreground max-md:hidden">
            <span>Service Name</span><span>Price</span><span>Duration</span><span>Actions</span>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 p-6 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading services</div>
          ) : services.length === 0 ? (
            <div className="p-6 text-muted-foreground">No services yet. Add your first dental service.</div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="grid gap-3 border-b p-4 last:border-b-0 md:grid-cols-[1fr_7rem_7rem_6rem] md:items-center">
                <strong>{service.name}</strong>
                <span>{service.price}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-primary" /> {service.duration}</span>
                <div className="flex gap-2">
                  <Button variant="glass" size="icon" onClick={() => editService(service)} aria-label="Edit service"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => deleteService(service.id)} aria-label="Delete service"><Trash2 className="h-4 w-4" /></Button>
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
    supabase.from("clinic_bookings").select("*").order("booking_date", { ascending: true }).then(({ data, error }) => {
      if (error) toast.error(error.message);
      else setBookings(data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader title="Bookings" subtitle="Review patient appointments captured by the booking assistant." />
      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        <div className="grid grid-cols-4 gap-3 border-b p-4 text-sm font-bold text-muted-foreground max-md:hidden">
          <span>Customer name</span><span>Service</span><span>Date</span><span>Time</span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 p-6 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading bookings</div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-muted-foreground">No bookings yet. New appointments will appear here.</div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="grid gap-3 border-b p-4 last:border-b-0 md:grid-cols-4 md:items-center">
              <strong>{booking.customer_name}</strong>
              <span>{booking.service}</span>
              <span>{booking.booking_date}</span>
              <span>{booking.booking_time.slice(0, 5)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AgentSettingsPage = ({ userId }: { userId: string }) => {
  const [settings, setSettings] = useState<AgentSettings | null>(null);
  const [prompt, setPrompt] = useState("");
  const [fullBooking, setFullBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("agent_settings").select("*").maybeSingle();
      if (error) toast.error(error.message);
      if (data) {
        setSettings(data);
        setPrompt(data.system_prompt);
        setFullBooking(data.mode === "full_booking");
      } else {
        const { data: created, error: createError } = await supabase.from("agent_settings").insert({ user_id: userId }).select("*").single();
        if (createError) toast.error(createError.message);
        if (created) {
          setSettings(created);
          setPrompt(created.system_prompt);
          setFullBooking(created.mode === "full_booking");
        }
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  const save = async () => {
    if (!settings || prompt.trim().length < 20 || prompt.length > 2500) {
      toast.error("System prompt must be between 20 and 2500 characters.");
      return;
    }
    const { error } = await supabase
      .from("agent_settings")
      .update({ system_prompt: prompt.trim(), mode: fullBooking ? "full_booking" : "information_only" })
      .eq("id", settings.id);
    if (error) toast.error(error.message);
    else toast.success("Agent settings saved");
  };

  return (
    <div>
      <PageHeader title="Agent Settings" subtitle="Control the assistant’s system instructions and booking behavior." />
      <div className="rounded-2xl border bg-card p-5 shadow-soft">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading settings</div>
        ) : (
          <div className="space-y-5">
            <label className="block space-y-2 text-sm font-semibold">
              <span>Editable System Prompt</span>
              <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-56" maxLength={2500} />
            </label>
            <div className="flex flex-col gap-4 rounded-xl border bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display font-bold">Booking mode</p>
                <p className="text-sm text-muted-foreground">{fullBooking ? "Full Booking Mode" : "Information Only"}</p>
              </div>
              <div className="flex items-center gap-3 font-semibold">
                <span>Information Only</span>
                <Switch checked={fullBooking} onCheckedChange={setFullBooking} />
                <span>Full Booking Mode</span>
              </div>
            </div>
            <Button variant="hero" onClick={save}><Save className="h-4 w-4" /> Save Settings</Button>
          </div>
        )}
      </div>
    </div>
  );
};

const LanguagesPage = () => {
  const languages = ["English", "French", "Spanish", "German"];
  return (
    <div>
      <PageHeader title="Languages" subtitle="Language options prepared for multilingual patient conversations." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {languages.map((language) => (
          <div key={language} className="rounded-2xl border bg-card p-5 shadow-soft">
            <Globe2 className="mb-4 h-6 w-6 text-primary" />
            <h2 className="font-display text-xl font-bold">{language}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Available for assistant responses.</p>
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
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setChecking(false);
    });

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
        <Route path="services" element={<ServicesPage userId={userId} />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="agent-settings" element={<AgentSettingsPage userId={userId} />} />
        <Route path="languages" element={<LanguagesPage />} />
        <Route path="*" element={<Navigate to="services" replace />} />
      </Routes>
    );
  }, [userId]);

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Checking session</div>;
  }

  if (!userId) return <Navigate to="/login" replace />;

  return <DashboardShell onSignOut={signOut}>{routes}</DashboardShell>;
};

export default Dashboard;
