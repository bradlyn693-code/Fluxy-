import {
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Database,
  HardDrive,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic,
  Minus,
  MoreHorizontal,
  Receipt,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

type Plan = {
  name: string;
  price: number;
  currency: string;
  memory: string;
  disk: string;
  cpu: string;
  databases: number;
  backups: number;
  accent: "sky" | "blue" | "violet" | "fuchsia" | "amber";
  popular?: boolean;
};

const plans: Plan[] = [
  { name: "Starter", price: 50, currency: "Kshs", memory: "400 MB", disk: "2000 MB", cpu: "100%", databases: 1, backups: 1, accent: "sky" },
  { name: "Basic", price: 80, currency: "KES", memory: "1024 MB", disk: "5000 MB", cpu: "150%", databases: 2, backups: 2, accent: "blue" },
  { name: "Standard", price: 100, currency: "KES", memory: "2048 MB", disk: "10240 MB", cpu: "200%", databases: 3, backups: 3, accent: "violet", popular: true },
  { name: "Pro", price: 150, currency: "KES", memory: "4096 MB", disk: "20480 MB", cpu: "300%", databases: 5, backups: 5, accent: "fuchsia" },
  { name: "Unlimited", price: 250, currency: "KES", memory: "0 MB", disk: "0 MB", cpu: "0%", databases: 10, backups: 10, accent: "amber" },
];

const accentClasses = { sky: "bg-sky-400", blue: "bg-blue-400", violet: "bg-violet-400", fuchsia: "bg-fuchsia-400", amber: "bg-amber-400" };

type Page = "dashboard" | "servers" | "wallet" | "channels";

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-cyan-400 to-indigo-500 shadow-[0_0_24px_rgba(56,189,248,0.35)]">
        <span className="relative z-10 text-xl font-black italic text-white">F</span>
        <span className="absolute -bottom-3 -right-2 size-8 rounded-full bg-white/20 blur-md" />
      </div>
      {!compact && (
        <div>
          <div className="text-[15px] font-black tracking-tight text-white">Fluxy Tech</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Cloud infrastructure</div>
        </div>
      )}
    </div>
  );
}

function LoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("alex@fluxy.tech");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Enter your email and password to continue");
      return;
    }
    localStorage.setItem("fluxy-auth", "true");
    localStorage.setItem("fluxy-email", email.trim());
    toast.success("Welcome back to Fluxy Tech");
    navigate("/dashboard");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060a18] px-4 py-10 text-white">
      <div className="nebula-orb nebula-orb-one" />
      <div className="nebula-orb nebula-orb-two" />
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_18%_22%,rgba(59,130,246,0.22)_0,transparent_25%),radial-gradient(circle_at_88%_10%,rgba(34,211,238,0.16)_0,transparent_26%)]" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="glass-panel rounded-[28px] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-300"><Sparkles className="size-3.5" /> Control plane access</div>
            <h1 className="text-3xl font-black tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Sign in to manage your servers, plans, and payments.</p>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <label className="block text-sm font-semibold text-slate-200">
              Email address
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-3 transition focus-within:border-blue-400/80 focus-within:ring-4 focus-within:ring-blue-500/10">
                <UserRound className="size-4 text-slate-500" />
                <input aria-label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="you@example.com" />
              </div>
            </label>
            <label className="block text-sm font-semibold text-slate-200">
              Password
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-3 transition focus-within:border-blue-400/80 focus-within:ring-4 focus-within:ring-blue-500/10">
                <ShieldCheck className="size-4 text-slate-500" />
                <input aria-label="Password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="••••••••" />
                <button type="button" className="text-xs font-semibold text-slate-500 hover:text-white" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button>
              </div>
            </label>
            <div className="flex items-center justify-between text-xs text-slate-500"><label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-blue-500" /> Remember me</label><button type="button" onClick={() => toast("Password reset is ready for your inbox")} className="font-semibold text-blue-300 hover:text-blue-200">Forgot password?</button></div>
            <button type="submit" className="primary-button w-full py-3.5">Log In <ArrowRight className="size-4" /></button>
          </form>
          <div className="mt-7 flex items-center gap-3 text-xs text-slate-500"><div className="h-px flex-1 bg-white/10" /> Secure workspace <div className="h-px flex-1 bg-white/10" /></div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-600">By continuing, you agree to Fluxy Tech's terms and privacy policy.</p>
      </div>
    </main>
  );
}

function Sidebar({ page, setPage, onLogout, isOpen, onClose }: { page: Page; setPage: (page: Page) => void; onLogout: () => void; isOpen: boolean; onClose: () => void }) {
  const navItems: { id: Page; label: string; icon?: typeof LayoutDashboard; emoji?: string; helper: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, helper: "Overview & plans" },
    { id: "servers", label: "My Servers", icon: Server, helper: "Your infrastructure" },
    { id: "wallet", label: "Wallet", icon: WalletCards, helper: "Payments & billing" },
    { id: "channels", label: "Channels", emoji: "📺", helper: "Channels for sale" },
  ];

  return <aside className={`sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-blue-900/30 bg-[#0c1228]/95 p-4 backdrop-blur-2xl transition-transform duration-200 ease-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
    <div className="flex items-center justify-between px-2 py-2"><Logo /><button className="icon-button md:hidden" aria-label="Close menu" onClick={onClose}><X className="size-4" /></button></div>
    <div className="my-8 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
    <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">Workspace</div>
    <nav className="space-y-1.5">
      {navItems.map(({ id, label, icon: Icon, emoji, helper }) => <button key={id} onClick={() => { setPage(id); onClose(); }} className={`nav-item ${page === id ? "nav-item-active" : ""}`}>{emoji ? <span className="grid size-[18px] place-items-center text-base leading-none">{emoji}</span> : Icon && <Icon className="size-[18px]" />}<span className="flex-1 text-left"><span className="block text-sm font-semibold">{label}</span><span className="mt-0.5 block text-[10px] text-slate-600">{helper}</span></span>{page === id && <ChevronRight className="size-3.5 text-blue-300" />}</button>)}
    </nav>
    <div className="mt-auto space-y-4">
      <div className="rounded-2xl border border-blue-400/10 bg-blue-500/[0.06] p-4"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold text-slate-300">Need a hand?</span><CircleHelp className="size-4 text-blue-300" /></div><p className="text-[11px] leading-5 text-slate-500">Our cloud crew is online 24/7.</p><button onClick={() => toast.success("Support request started")} className="mt-3 text-xs font-bold text-blue-300 hover:text-blue-200">Open support <ArrowRight className="ml-1 inline size-3" /></button></div>
      <div className="flex items-center gap-3 border-t border-white/5 px-2 pt-4"><div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-blue-600 text-xs font-black text-white">AR</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-white">Alex Rivera</div><div className="truncate text-[11px] text-slate-500">alex@fluxy.tech</div></div><button aria-label="Log out" onClick={onLogout} className="text-slate-600 transition hover:text-white"><LogOut className="size-4" /></button></div>
    </div>
  </aside>;
}

function Topbar({ setPage, onMenu }: { setPage: (page: Page) => void; onMenu: () => void }) {
  const [search, setSearch] = useState("");
  return <header className="mb-8 flex items-center justify-between gap-4"><div className="flex items-center gap-3 md:hidden"><button className="icon-button" aria-label="Open menu" onClick={onMenu}><Menu className="size-5" /></button><Logo compact /></div><div className="relative hidden max-w-md flex-1 md:block"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-600" /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { setPage("dashboard"); toast(search ? `Showing results for ${search}` : "Browse all hosting plans"); } }} className="w-full rounded-xl border border-white/10 bg-white/[0.035] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:bg-white/[0.055]" placeholder="Search plans..." /></div><div className="flex items-center gap-2"><button className="icon-button relative" aria-label="Notifications" onClick={() => toast("You're all caught up")}><Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-cyan-400" /></button><button onClick={() => { setPage("dashboard"); toast("Choose a plan to upgrade your workspace"); }} className="primary-button hidden px-4 py-2.5 text-xs sm:flex">Upgrade <Zap className="size-3.5 fill-current" /></button></div></header>;
}

function PlanCard({ plan, buy }: { plan: Plan; buy: (plan: Plan) => void }) {
  return <article className={`plan-card ${plan.popular ? "plan-card-popular" : ""} relative flex min-h-[390px] flex-col p-5 ${plan.popular ? "mt-3 md:mt-0" : ""}`}>
    {plan.popular && <div className="popular-badge"><Sparkles className="size-3" /> POPULAR</div>}
    <div className="mb-6 flex items-start justify-between"><div><div className="mb-3 flex items-center gap-2"><span className={`size-2 rounded-full ${accentClasses[plan.accent]} shadow-[0_0_10px_currentColor]`} /><h2 className="text-lg font-black text-white">{plan.name}</h2></div><div className="flex items-baseline gap-1"><span className="text-2xl font-black tracking-tight text-white">{plan.currency} {plan.price.toFixed(2)}</span><span className="text-xs text-slate-500">/ month</span></div></div><button aria-label={`More about ${plan.name}`} className="text-slate-600 hover:text-slate-300" onClick={() => toast(`${plan.name} includes instant provisioning and 24/7 support`)}><MoreHorizontal className="size-5" /></button></div>
    <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600"><span className="size-1 rounded-full bg-blue-400" /> Plan capacity</div>
    <div className="mt-3 border-t border-white/10 pt-4"><div className="space-y-3 text-sm"><Spec icon={Mic} label="Memory" value={plan.memory} /><Spec icon={HardDrive} label="Disk" value={plan.disk} /><Spec icon={Zap} label="CPU" value={plan.cpu} /><Spec icon={Database} label="Databases" value={String(plan.databases)} /><Spec icon={Receipt} label="Backups" value={String(plan.backups)} /></div></div>
    <button onClick={() => buy(plan)} className={`primary-button mt-auto w-full py-2.5 ${plan.popular ? "shadow-[0_0_22px_rgba(37,99,235,0.35)]" : ""}`}>BUY NOW <ArrowRight className="size-4" /></button>
  </article>;
}

function Spec({ icon: Icon, label, value }: { icon: typeof Database; label: string; value: string }) { return <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-slate-500"><Icon className="size-3.5 text-slate-600" />{label}</span><span className="font-bold text-slate-200">{value}</span></div>; }

function DashboardPage({ buy, goChannels }: { buy: (plan: Plan) => void; goChannels: () => void }) {
  return <div className="animate-page"><button onClick={goChannels} className="mb-6 flex w-full flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-300/20 bg-gradient-to-r from-amber-400/[0.12] via-blue-500/[0.08] to-transparent px-4 py-3 text-left transition hover:border-amber-300/40 hover:bg-amber-400/[0.16]"><span className="text-sm font-bold text-amber-100">🔥 Channels for Sale</span><span className="text-xs font-semibold text-slate-300">1K KES 670&nbsp; | &nbsp;2K KES 900&nbsp; | &nbsp;5K KES 1400&nbsp; — <span className="text-blue-300 underline">Click here</span></span></button><div className="mb-2 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300"><span className="size-1.5 animate-pulse rounded-full bg-cyan-300" /> Infrastructure ready</div><h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">Hosting Plans</h1><p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">Choose the perfect plan for your projects <span className="text-slate-600">—</span> scale anytime.</p></div><div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-slate-500 md:flex"><ShieldCheck className="size-4 text-emerald-400" /> 99.9% uptime SLA</div></div><div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">{plans.map((plan) => <PlanCard key={plan.name} plan={plan} buy={buy} />)}</div><div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-xs text-slate-500"><span>24/7 support</span><span className="size-1 rounded-full bg-blue-400/60" /><span>Instant provisioning</span><span className="size-1 rounded-full bg-blue-400/60" /><span>99.9% Uptime SLA</span></div></div>;
}

const channelPlans = [
  { name: "1K Followers Channel", price: 670, icon: "👥", count: "1K", features: ["Monetized ready", "Organic followers", "Instant delivery", "Support 24/7"] },
  { name: "2K Followers Channel", price: 900, icon: "👥👥", count: "2K", popular: true, features: ["Monetized ready", "Organic followers", "Instant delivery", "Support 24/7", "Premium niche"] },
  { name: "5K Followers Channel", price: 1400, icon: "🚀", count: "5K", features: ["High engagement", "Monetized", "Viral potential", "Instant transfer", "Priority support"] },
];

function ChannelsPage({ buy }: { buy: (name: string, amount: number) => void }) {
  return <div className="animate-page"><div className="mb-8"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-400/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200"><span>📺</span> Digital assets marketplace</div><h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">Channels for Sale</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Launch faster with ready-to-grow channels built for creators, brands, and ambitious communities.</p></div><div className="grid grid-cols-1 gap-5 md:grid-cols-3">{channelPlans.map((channel) => <article key={channel.name} className={`plan-card relative flex min-h-[390px] flex-col rounded-2xl p-6 ${channel.popular ? "plan-card-popular mt-3 md:mt-0" : ""}`}>{channel.popular && <div className="popular-badge"><Sparkles className="size-3" /> POPULAR</div>}<div className="mb-7 flex items-start justify-between"><div className="grid size-16 place-items-center rounded-2xl border border-blue-300/15 bg-blue-500/10 text-3xl">{channel.icon}</div><div className="text-right"><div className="text-2xl font-black text-blue-400">{channel.count}</div><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">followers</div></div></div><h2 className="text-xl font-black text-white">{channel.name}</h2><div className="mt-2 flex items-baseline gap-1"><span className="text-2xl font-black text-blue-400">KES {channel.price.toFixed(0)}</span><span className="text-xs text-slate-500">one-time</span></div><div className="my-5 h-px bg-white/10" /><ul className="space-y-3 text-sm text-slate-300">{channel.features.map((feature) => <li key={feature} className="flex items-center gap-2"><Check className="size-4 text-emerald-400" />{feature}</li>)}</ul><button onClick={() => buy(channel.name, channel.price)} className="primary-button mt-auto w-full py-3">BUY NOW <ArrowRight className="size-4" /></button></article>)}</div></div>;
}

function ServersPage({ setPage, buy }: { setPage: (page: Page) => void; buy: (name: string, amount: number) => void }) {
  return <div className="animate-page"><div className="mb-2"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300"><Server className="size-3" /> Fleet status</div><h1 className="text-4xl font-black tracking-[-0.04em] text-white">My Servers <span className="text-3xl">🕋</span></h1><p className="mt-3 text-sm text-slate-400">Provision an Admin Panel to create and manage your server fleet.</p></div><article className="plan-card plan-card-popular relative mx-auto mt-8 max-w-md rounded-2xl p-6 text-center"><div className="popular-badge"><Sparkles className="size-3" /> POPULAR</div><div className="mx-auto mb-5 grid size-20 place-items-center rounded-2xl border border-blue-300/20 bg-blue-500/10 text-5xl shadow-[0_0_30px_rgba(37,99,235,0.2)]">⚙️</div><h2 className="text-2xl font-black text-white">Admin Panel</h2><div className="mt-3 text-3xl font-black text-blue-400">KES 450</div><div className="my-6 h-px bg-white/10" /><ul className="space-y-3 text-left text-sm text-slate-300"><li className="flex items-center gap-3"><Check className="size-4 text-emerald-400" /> Create unlimited servers</li><li className="flex items-center gap-3"><Check className="size-4 text-emerald-400" /> Perfect responsiveness</li></ul><button onClick={() => buy("Admin Panel", 450)} className="primary-button mt-7 w-full py-3">BUY NOW <ArrowRight className="size-4" /></button></article><div className="glass-panel mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-3xl p-10 text-center"><div className="mb-5 grid size-16 place-items-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300 shadow-[0_0_36px_rgba(37,99,235,0.14)]"><Server className="size-7" /></div><h2 className="text-xl font-black text-white">My Active Servers</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">No servers yet. Buy Admin Panel to create.</p><button onClick={() => buy("Admin Panel", 450)} className="primary-button mt-6 px-5 py-3">Buy Admin Panel <ArrowRight className="size-4" /></button></div></div>;
}

function WalletPage({ selectedPlan, selectedAmount, setPage }: { selectedPlan: string; selectedAmount: number; setPage: (page: Page) => void }) {
  const params = new URLSearchParams(window.location.search);
  const embeddedAmount = Number(params.get("amount"));
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const amount = embeddedAmount > 0 ? embeddedAmount : selectedAmount;
  const planName = embeddedAmount > 0 && !selectedPlan ? "Fluxy plan" : selectedPlan || "Select a plan";

  const pay = async (event: FormEvent) => {
    event.preventDefault();
    const normalized = phone.replace(/\s+/g, "");
    if (!/^0?7\d{8}$/.test(normalized)) { setStatus("Enter a valid Safaricom number, e.g. 0712 345 678."); return; }
    if (!amount) { setStatus("Select a hosting plan first."); return; }
    setIsPaying(true); setStatus("Sending STK to your phone...");
    try {
      const response = await fetch("/api/pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: normalized, amount, reference: planName }) });
      if (!response.ok) throw new Error("Payment request failed");
      setStatus("✓ Check your phone and enter your M-Pesa PIN.");
    } catch { setStatus("STK sent! Check your phone to complete payment."); }
    finally { setIsPaying(false); }
  };

  return <div className="animate-page"><div className="mb-2"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300"><CreditCard className="size-3" /> Secure checkout</div><h1 className="text-4xl font-black tracking-[-0.04em] text-white">Wallet <span className="text-3xl">🏛</span></h1><p className="mt-3 text-sm text-slate-400">Pay securely with M-Pesa and get provisioned instantly.</p></div><div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"><div className="glass-panel rounded-3xl p-6 sm:p-8"><div className="mb-8 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Payment details</p><h2 className="mt-2 text-2xl font-black text-white">Complete your order</h2></div><div className="grid size-11 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400"><ShieldCheck className="size-5" /></div></div><form onSubmit={pay} className="max-w-lg space-y-5"><div><div className="mb-2 text-sm font-semibold text-slate-200">Selected plan</div><div className="flex items-center justify-between rounded-xl border border-blue-400/20 bg-blue-500/[0.08] px-4 py-3"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-lg bg-blue-500/15 text-blue-300"><Sparkles className="size-4" /></div><div><div className="text-sm font-bold text-white">{planName}</div><div className="text-[11px] text-slate-500">Monthly hosting subscription</div></div></div>{selectedAmount === 0 && !embeddedAmount ? <button type="button" onClick={() => setPage("dashboard")} className="text-xs font-bold text-blue-300">Browse plans</button> : <Check className="size-4 text-emerald-400" />}</div></div><label className="block text-sm font-semibold text-slate-200">M-Pesa phone number<div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-3 transition focus-within:border-blue-400/80 focus-within:ring-4 focus-within:ring-blue-500/10"><span className="text-sm font-bold text-slate-500">+254</span><input aria-label="M-Pesa phone number" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="07XX XXX XXX" inputMode="tel" /></div></label><div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] p-4"><span className="text-sm text-slate-400">Amount to pay</span><span className="text-xl font-black text-blue-300">KES {amount.toFixed(2)}</span></div><button type="submit" disabled={isPaying} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00b04f] py-3.5 text-sm font-black text-white shadow-[0_0_25px_rgba(0,176,79,0.18)] transition hover:bg-[#08c761] disabled:cursor-wait disabled:opacity-60">{isPaying ? "Sending request..." : "Pay with M-Pesa"}<ArrowRight className="size-4" /></button>{status && <p role="status" className={`text-sm ${status.startsWith("✓") || status.startsWith("STK") ? "text-emerald-400" : "text-slate-400"}`}>{status}</p>}</form></div><div className="hidden flex-col justify-between rounded-3xl border border-blue-400/10 bg-gradient-to-br from-blue-500/[0.13] via-indigo-500/[0.06] to-transparent p-7 xl:flex"><div><div className="mb-10 flex items-center justify-between"><span className="text-sm font-black tracking-tight text-white">Fluxy secure wallet</span><WalletCards className="size-5 text-blue-300" /></div><div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Your plan today</div><div className="mt-2 text-3xl font-black text-white">KES {amount.toFixed(2)}</div><div className="mt-1 text-sm text-slate-500">{planName} · billed monthly</div></div><div><div className="mb-4 h-px bg-white/10" /><div className="flex items-center gap-3 text-xs text-slate-500"><ShieldCheck className="size-4 text-emerald-400" /> Encrypted payment handoff</div><div className="mt-3 flex items-center gap-3 text-xs text-slate-500"><Zap className="size-4 text-amber-300" /> Instant provisioning after payment</div></div></div></div></div>;
}

function DashboardShell() {
  const [, navigate] = useLocation();
  const path = window.location.pathname;
  const [page, setPageState] = useState<Page>(path.includes("servers") ? "servers" : path.includes("wallet") || path.includes("pay/fluxt") ? "wallet" : path.includes("channels") ? "channels" : "dashboard");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { if (path === "/" || path === "/login") navigate("/dashboard"); }, [navigate, path]);
  const setPage = (next: Page) => { setPageState(next); navigate(`/${next}`); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const buy = (plan: Plan) => { setSelectedPlan(plan.name); setSelectedAmount(plan.price); toast.success(`${plan.name} selected`, { description: "Continue in Wallet to pay with M-Pesa." }); setPage("wallet"); };
  const buyChannel = (name: string, amount: number) => { setSelectedPlan(name); setSelectedAmount(amount); toast.success(`${name} selected`, { description: "Continue in Wallet to pay with M-Pesa." }); setPage("wallet"); };
  const logout = () => { localStorage.removeItem("fluxy-auth"); navigate("/login"); toast("You have been logged out"); };

  return <div className="min-h-screen bg-[#060a18] text-white"><div className="nebula-orb nebula-orb-one" /><div className="nebula-orb nebula-orb-two" />{sidebarOpen && <button type="button" aria-label="Close menu overlay" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/50 md:hidden" />}<Sidebar page={page} setPage={setPage} onLogout={logout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /><main className="relative min-h-screen md:ml-64"><div className="mx-auto max-w-[1500px] px-5 py-5 sm:px-8 sm:py-7"><Topbar setPage={setPage} onMenu={() => setSidebarOpen(true)} />{page === "dashboard" && <DashboardPage buy={buy} goChannels={() => setPage("channels")} />}{page === "servers" && <ServersPage setPage={setPage} buy={buyChannel} />}{page === "wallet" && <WalletPage selectedPlan={selectedPlan} selectedAmount={selectedAmount} setPage={setPage} />}{page === "channels" && <ChannelsPage buy={buyChannel} />}</div></main></div>;
}

export default function Home() {
  const [location] = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => { setAuthenticated(localStorage.getItem("fluxy-auth") === "true"); }, [location]);
  const path = location;
  if (path === "/login") return <LoginPage />;
  if (path === "/pay/fluxt") return <WalletPage selectedPlan="" selectedAmount={0} setPage={() => {}} />;
  if (!authenticated) return <LoginPage />;
  return <DashboardShell />;
}
