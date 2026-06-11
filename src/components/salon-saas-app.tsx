"use client";

import { useMemo, useState } from "react";
import {
  BadgePercent,
  Bell,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  Clock,
  CreditCard,
  Gem,
  Globe2,
  LockKeyhole,
  Moon,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  TimerReset,
  UserPlus,
  WalletCards,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  bookingSteps,
  customers,
  navItems,
  plans,
  platformStats,
  portalTabs,
  revenueData,
  services,
  staff,
  staffAgenda,
  tenantStats,
  timeline,
  type PortalKey,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("ar-SA", {
  maximumFractionDigits: 0,
});

const toneClasses: Record<string, string> = {
  mint: "bg-spa-mint/25 text-primary ring-spa-mint/50",
  amber: "bg-spa-amber/20 text-amber-800 ring-spa-amber/50",
  blush: "bg-spa-blush/30 text-rose-900 ring-spa-blush/50",
  lilac: "bg-spa-lilac/30 text-violet-900 ring-spa-lilac/50",
};

const statusClasses: Record<string, string> = {
  confirmed: "bg-primary text-primary-foreground",
  waiting: "bg-spa-amber text-spa-ink",
  completed: "bg-spa-mint text-primary",
  deposit: "bg-spa-blush text-rose-950",
};

export function SalonSaasApp() {
  const [portal, setPortal] = useState<PortalKey>("salon");
  const [activeCustomerId, setActiveCustomerId] = useState(customers[0].id);
  const [activeServiceId, setActiveServiceId] = useState(services[0].id);
  const [activeStaffId, setActiveStaffId] = useState(staff[0].id);
  const [search, setSearch] = useState("");

  const activeCustomer =
    customers.find((customer) => customer.id === activeCustomerId) ?? customers[0];
  const activeService =
    services.find((service) => service.id === activeServiceId) ?? services[0];
  const activeStaff = staff.find((member) => member.id === activeStaffId) ?? staff[0];

  const filteredCustomers = useMemo(() => {
    const normalized = search.trim();
    if (!normalized) {
      return customers;
    }

    return customers.filter((customer) =>
      [customer.name, customer.phone, customer.tier, ...customer.tags]
        .join(" ")
        .includes(normalized)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--spa-blush)/0.22),transparent_28rem),linear-gradient(135deg,hsl(var(--background)),hsl(var(--accent)/0.42))] text-foreground">
      <div className="mx-auto grid min-h-screen w-full min-w-0 max-w-[1600px] gap-0 overflow-x-hidden lg:grid-cols-[minmax(0,1fr)_280px]">
        <aside className="min-w-0 overflow-hidden border-b border-border bg-card/90 px-4 py-4 backdrop-blur lg:col-start-2 lg:row-start-1 lg:h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <Sidebar />
        </aside>

        <main className="min-w-0 overflow-x-hidden lg:col-start-1 lg:row-start-1 lg:h-screen lg:overflow-y-auto">
          <div className="flex min-h-screen min-w-0 flex-col gap-5 px-4 py-4 sm:px-6 lg:px-7 lg:py-6">
            <TopBar portal={portal} setPortal={setPortal} />

            {portal === "salon" ? (
              <SalonAdminSurface
                activeCustomer={activeCustomer}
                activeCustomerId={activeCustomerId}
                activeService={activeService}
                activeServiceId={activeServiceId}
                activeStaff={activeStaff}
                activeStaffId={activeStaffId}
                filteredCustomers={filteredCustomers}
                search={search}
                setActiveCustomerId={setActiveCustomerId}
                setActiveServiceId={setActiveServiceId}
                setActiveStaffId={setActiveStaffId}
                setSearch={setSearch}
              />
            ) : null}

            {portal === "client" ? (
              <ClientPortalSurface
                activeCustomer={activeCustomer}
                activeService={activeService}
                activeServiceId={activeServiceId}
                activeStaff={activeStaff}
                activeStaffId={activeStaffId}
                setActiveServiceId={setActiveServiceId}
                setActiveStaffId={setActiveStaffId}
              />
            ) : null}

            {portal === "staff" ? (
              <StaffPortalSurface activeCustomer={activeCustomer} activeStaff={activeStaff} />
            ) : null}

            {portal === "platform" ? <PlatformSurface /> : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="flex h-full min-w-0 flex-col gap-5">
      <div className="flex items-center justify-between gap-3 lg:justify-start">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Sparkles aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-lg font-extrabold leading-tight">Luma SalonOS</p>
          <p className="text-xs font-semibold text-muted-foreground">منصة حجوزات الصالونات</p>
        </div>
      </div>

      <Separator />

      <nav className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = index < 3;

          return (
            <button
              key={item.label}
              className={cn(
                "group flex min-w-0 items-center gap-3 overflow-hidden rounded-lg border px-3 py-2.5 text-right transition",
                active
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
              )}
              type="button"
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-md",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <Icon aria-hidden="true" />
              </span>
              <span className="min-w-0 overflow-hidden">
                <span className="block truncate text-sm font-bold">{item.label}</span>
                <span className="hidden truncate text-xs text-muted-foreground lg:block">
                  {item.hint}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto hidden rounded-lg border bg-muted/50 p-3 lg:block">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold">
          <ShieldCheck aria-hidden="true" />
          عزل المستأجرين
        </div>
        <p className="text-xs leading-6 text-muted-foreground">
          كل شاشة في هذا النموذج مبنية حول `tenant_id` وسياسات RLS في قاعدة Supabase.
        </p>
      </div>
    </div>
  );
}

function TopBar({
  portal,
  setPortal,
}: {
  portal: PortalKey;
  setPortal: (portal: PortalKey) => void;
}) {
  return (
    <header className="flex min-w-0 flex-col gap-4 rounded-lg border bg-card/90 p-3 soft-shadow sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-bold text-muted-foreground">صالون لوميير سبا</p>
          <h1 className="font-heading text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
            مركز التشغيل اليومي للحجوزات والعميلات
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            <Globe2 data-icon="inline-start" />
            lumier.platform.com
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="تنبيهات">
            <Bell />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="الوضع الداكن">
            <Moon />
          </Button>
          <Button size="sm">
            <Plus data-icon="inline-start" />
            حجز جديد
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {portalTabs.map((tab) => {
          const Icon = tab.icon;
          const active = portal === tab.key;

          return (
            <button
              key={tab.key}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-bold transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
              type="button"
              onClick={() => setPortal(tab.key)}
            >
              <Icon aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}

function SalonAdminSurface({
  activeCustomer,
  activeCustomerId,
  activeService,
  activeServiceId,
  activeStaff,
  activeStaffId,
  filteredCustomers,
  search,
  setActiveCustomerId,
  setActiveServiceId,
  setActiveStaffId,
  setSearch,
}: {
  activeCustomer: (typeof customers)[number];
  activeCustomerId: string;
  activeService: (typeof services)[number];
  activeServiceId: string;
  activeStaff: (typeof staff)[number];
  activeStaffId: string;
  filteredCustomers: typeof customers;
  search: string;
  setActiveCustomerId: (id: string) => void;
  setActiveServiceId: (id: string) => void;
  setActiveStaffId: (id: string) => void;
  setSearch: (value: string) => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="flex min-w-0 flex-col gap-5">
        <StatsGrid stats={tenantStats} />

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,0.95fr)_minmax(380px,1.05fr)]">
          <BookingWizard
            activeService={activeService}
            activeServiceId={activeServiceId}
            activeStaff={activeStaff}
            activeStaffId={activeStaffId}
            setActiveServiceId={setActiveServiceId}
            setActiveStaffId={setActiveStaffId}
          />
          <BookingTimeline />
        </div>

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <RevenueCard />
          <CustomerTable
            activeCustomerId={activeCustomerId}
            customersList={filteredCustomers}
            search={search}
            setActiveCustomerId={setActiveCustomerId}
            setSearch={setSearch}
          />
        </div>
      </section>

      <CustomerProfile customer={activeCustomer} />
    </div>
  );
}

function StatsGrid({
  stats,
}: {
  stats: Array<{ label: string; value: string; delta: string; tone?: string }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="soft-shadow">
          <CardHeader className="pb-0">
            <CardDescription>{stat.label}</CardDescription>
            <CardAction>
              <Badge
                className={cn(
                  "ring-1",
                  toneClasses[stat.tone ?? "mint"] ?? toneClasses.mint
                )}
                variant="secondary"
              >
                {stat.delta}
              </Badge>
            </CardAction>
            <CardTitle className="text-3xl">{stat.value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-label={`الإشغال ${value}%`}>
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function BookingWizard({
  activeService,
  activeServiceId,
  activeStaff,
  activeStaffId,
  setActiveServiceId,
  setActiveStaffId,
}: {
  activeService: (typeof services)[number];
  activeServiceId: string;
  activeStaff: (typeof staff)[number];
  activeStaffId: string;
  setActiveServiceId: (id: string) => void;
  setActiveStaffId: (id: string) => void;
}) {
  const deposit = Math.round(activeService.price * 0.3);

  return (
    <Card className="soft-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus aria-hidden="true" />
          محرك الحجز الذكي
        </CardTitle>
        <CardDescription>
          اختيار خدمة وموظفة مع عربون وقفل موعد أثناء الإتمام.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2 sm:grid-cols-4">
          {bookingSteps.map((step) => (
            <div
              key={step.label}
              className={cn(
                "rounded-lg border p-3",
                step.state === "active"
                  ? "border-primary bg-primary/10"
                  : step.state === "done"
                    ? "border-spa-mint bg-spa-mint/20"
                    : "border-border bg-muted/40"
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-muted-foreground">{step.label}</span>
                {step.state === "done" ? <CheckCircle2 aria-hidden="true" /> : null}
              </div>
              <p className="text-sm font-bold leading-6">{step.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border bg-background p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-bold">الخدمات</p>
              <Badge variant="outline">{services.length} نشطة</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  className={cn(
                    "rounded-md border p-3 text-right transition",
                    activeServiceId === service.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/60"
                  )}
                  type="button"
                  onClick={() => setActiveServiceId(service.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">{service.name}</span>
                    <span className="text-sm font-bold text-primary">
                      {currencyFormatter.format(service.price)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {service.category} · {service.duration} دقيقة · طلب {service.demand}%
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-bold">الموظفات المتاحات</p>
              <Badge variant="outline">قفل 7 دقائق</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {staff.map((member) => (
                <button
                  key={member.id}
                  className={cn(
                    "rounded-md border p-3 text-right transition",
                    activeStaffId === member.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/60"
                  )}
                  type="button"
                  onClick={() => setActiveStaffId(member.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">{member.name}</span>
                    <span className="text-xs text-muted-foreground">{member.status}</span>
                  </div>
                  <ProgressBar value={member.occupancy} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border bg-spa-mint/20 p-3 sm:grid-cols-3">
          <MiniFact icon={Clock} label="المدة" value={`${activeService.duration} دقيقة`} />
          <MiniFact icon={CircleDollarSign} label="السعر" value={currencyFormatter.format(activeService.price)} />
          <MiniFact icon={WalletCards} label="العربون" value={currencyFormatter.format(deposit)} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            الموظفة المختارة: <span className="font-bold text-foreground">{activeStaff.name}</span>
          </p>
          <Button>
            تثبيت الموعد
            <ChevronLeft data-icon="inline-end" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingTimeline() {
  return (
    <Card className="soft-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck aria-hidden="true" />
          تقويم الموظفات
        </CardTitle>
        <CardDescription>حجوزات اليوم حسب الموظفة من 9 ص إلى 7 م.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-5 text-xs font-bold text-muted-foreground">
          {["9 ص", "11 ص", "1 م", "3 م", "5 م"].map((slot) => (
            <span key={slot}>{slot}</span>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {timeline.map((row) => (
            <div key={row.staffId} className="grid gap-2 sm:grid-cols-[78px_1fr] sm:items-center">
              <div className="text-sm font-bold">{row.staff}</div>
              <div className="relative h-16 rounded-lg border bg-muted/40">
                <div className="absolute inset-y-0 right-[20%] border-r border-dashed border-border" />
                <div className="absolute inset-y-0 right-[40%] border-r border-dashed border-border" />
                <div className="absolute inset-y-0 right-[60%] border-r border-dashed border-border" />
                <div className="absolute inset-y-0 right-[80%] border-r border-dashed border-border" />
                {row.appointments.map((appointment) => (
                  <div
                    key={`${row.staffId}-${appointment.time}-${appointment.label}`}
                    className={cn(
                      "absolute top-2 flex h-12 flex-col justify-center rounded-md px-2 text-xs font-bold shadow-sm",
                      statusClasses[appointment.status]
                    )}
                    style={{
                      right: appointment.start,
                      width: appointment.width,
                    }}
                  >
                    <span className="truncate">{appointment.label}</span>
                    <span className="text-[11px] opacity-80">{appointment.time}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueCard() {
  return (
    <Card className="soft-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BadgePercent aria-hidden="true" />
          الإيرادات والإشغال
        </CardTitle>
        <CardDescription>نظرة أسبوعية للحجوزات المكتملة والمدفوعة.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <AreaTrendChart />
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerTable({
  activeCustomerId,
  customersList,
  search,
  setActiveCustomerId,
  setSearch,
}: {
  activeCustomerId: string;
  customersList: typeof customers;
  search: string;
  setActiveCustomerId: (id: string) => void;
  setSearch: (value: string) => void;
}) {
  return (
    <Card className="soft-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus aria-hidden="true" />
          قاعدة العميلات
        </CardTitle>
        <CardDescription>بحث، تصنيف، إنفاق، وسوم، وآخر زيارة.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-2.5 text-muted-foreground" aria-hidden="true" />
          <Input
            className="pr-10"
            placeholder="ابحثي بالاسم أو الوسم أو الجوال"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">العميلة</TableHead>
              <TableHead className="text-right">المستوى</TableHead>
              <TableHead className="text-right">الإنفاق</TableHead>
              <TableHead className="text-right">آخر زيارة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customersList.map((customer) => (
              <TableRow
                key={customer.id}
                className={cn(
                  "cursor-pointer",
                  activeCustomerId === customer.id ? "bg-primary/10" : ""
                )}
                onClick={() => setActiveCustomerId(customer.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback>{customer.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={customer.tier === "VIP" ? "default" : "secondary"}>
                    {customer.tier}
                  </Badge>
                </TableCell>
                <TableCell>{currencyFormatter.format(customer.spend)}</TableCell>
                <TableCell className="text-muted-foreground">{customer.lastVisit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CustomerProfile({ customer }: { customer: (typeof customers)[number] }) {
  return (
    <aside className="flex flex-col gap-5">
      <Card className="soft-shadow xl:sticky xl:top-6">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Avatar size="lg">
              <AvatarFallback>{customer.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle>{customer.name}</CardTitle>
              <CardDescription>{customer.phone}</CardDescription>
            </div>
            <Badge>{customer.tier}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            <MiniMetric label="زيارات" value={customer.visits.toString()} />
            <MiniMetric label="نقاط" value={percentFormatter.format(customer.points)} />
            <MiniMetric label="LTV" value={currencyFormatter.format(customer.spend)} />
          </div>

          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="mb-2 font-bold">ملف الجمال</p>
            <dl className="grid gap-2 text-sm">
              <ProfileRow label="البشرة" value={customer.beautyFile.skin} />
              <ProfileRow label="لون الشعر" value={customer.beautyFile.hairColor} />
              <ProfileRow label="الحساسية" value={customer.beautyFile.allergies} />
              <ProfileRow label="المفضلة" value={customer.beautyFile.favoriteServices} />
            </dl>
          </div>

          <div className="flex flex-wrap gap-2">
            {customer.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="rounded-lg border p-3">
            <p className="mb-2 font-bold">آخر الزيارات</p>
            <div className="flex flex-col gap-2">
              {customer.history.map((item) => (
                <div key={`${item.date}-${item.service}`} className="rounded-md bg-muted/50 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">{item.service}</span>
                    <span className="text-sm text-primary">
                      {currencyFormatter.format(item.amount)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.date} · {item.staff}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-spa-blush bg-spa-blush/20 p-3 text-sm leading-6">
            <p className="mb-1 font-bold">ملاحظة داخلية</p>
            <p className="text-muted-foreground">{customer.note}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            <Button>
              <CalendarPlus data-icon="inline-start" />
              حجز موعد
            </Button>
            <Button variant="outline">
              <Send data-icon="inline-start" />
              واتساب
            </Button>
            <Button variant="outline">
              <GiftIcon />
              إهداء نقاط
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

function ClientPortalSurface({
  activeCustomer,
  activeService,
  activeServiceId,
  activeStaff,
  activeStaffId,
  setActiveServiceId,
  setActiveStaffId,
}: {
  activeCustomer: (typeof customers)[number];
  activeService: (typeof services)[number];
  activeServiceId: string;
  activeStaff: (typeof staff)[number];
  activeStaffId: string;
  setActiveServiceId: (id: string) => void;
  setActiveStaffId: (id: string) => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="flex flex-col gap-5">
        <Card className="soft-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Gem aria-hidden="true" />
              بوابة العميلة الخاصة
            </CardTitle>
            <CardDescription>
              صفحة صالون عامة، ملف شخصي، ولاء، هدايا، وحجز متعدد الخطوات.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-lg border bg-gradient-to-br from-primary to-slate-900 p-5 text-primary-foreground">
                <div className="mb-10 flex items-center justify-between">
                  <p className="font-heading text-xl font-extrabold">Lumiere Spa</p>
                  <Badge className="bg-white/20 text-white" variant="outline">
                    تقييم 4.9
                  </Badge>
                </div>
                <h2 className="max-w-xl font-heading text-3xl font-extrabold leading-tight">
                  حجوزات فاخرة بوقت واضح وملف جمال يتذكر تفضيلاتك.
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button className="bg-white text-primary hover:bg-white/90">احجزي الآن</Button>
                  <Button className="border-white/30 text-white hover:bg-white/10" variant="outline">
                    معرض الصالون
                  </Button>
                </div>
              </div>

              <BookingWizard
                activeService={activeService}
                activeServiceId={activeServiceId}
                activeStaff={activeStaff}
                activeStaffId={activeStaffId}
                setActiveServiceId={setActiveServiceId}
                setActiveStaffId={setActiveStaffId}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-3">
          <ProfileBenefit icon={Star} label="مستواك" value={activeCustomer.tier} />
          <ProfileBenefit icon={WalletCards} label="محفظتك" value="220 ريال" />
          <ProfileBenefit icon={Zap} label="كود الإحالة" value="SARA-VIP" />
        </div>
      </section>

      <CustomerProfile customer={activeCustomer} />
    </div>
  );
}

function StaffPortalSurface({
  activeCustomer,
  activeStaff,
}: {
  activeCustomer: (typeof customers)[number];
  activeStaff: (typeof staff)[number];
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="soft-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock aria-hidden="true" />
              جدول {activeStaff.name} اليوم
            </CardTitle>
            <CardDescription>حالات الخدمة، التحضير، وطلب الإجازة.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {staffAgenda.map((item) => (
              <div key={`${item.time}-${item.client}`} className="rounded-lg border bg-background p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">{item.client}</p>
                    <p className="text-sm text-muted-foreground">{item.service}</p>
                  </div>
                  <Badge variant="secondary">{item.time}</Badge>
                </div>
                <p className="rounded-md bg-muted/50 p-2 text-sm leading-6 text-muted-foreground">
                  {item.prep}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm">بدء الخدمة</Button>
                  <Button size="sm" variant="outline">
                    إنهاء
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="soft-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TimerReset aria-hidden="true" />
              أداء الموظفة
            </CardTitle>
            <CardDescription>إشغال، عمولة، وتقييمات حسب صلاحيات المدير.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniMetric label="الإشغال" value={`${activeStaff.occupancy}%`} />
              <MiniMetric label="العمولة" value={currencyFormatter.format(activeStaff.commission)} />
              <MiniMetric label="التقييم" value="4.8" />
            </div>
            <div className="h-72">
              <BookingsBarChart />
            </div>
          </CardContent>
        </Card>
      </section>

      <CustomerProfile customer={activeCustomer} />
    </div>
  );
}

function PlatformSurface() {
  return (
    <div className="grid gap-5">
      <StatsGrid stats={platformStats} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="soft-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard aria-hidden="true" />
              خطط الاشتراك والحدود
            </CardTitle>
            <CardDescription>تجربة 14 يوم، فوترة شهرية، ومفاتيح ميزات لكل صالون.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className="rounded-lg border bg-background p-4">
                <div className="mb-5 flex items-center justify-between">
                  <p className="font-heading text-lg font-extrabold">{plan.name}</p>
                  <Badge variant="secondary">{plan.salons} صالون</Badge>
                </div>
                <p className="text-3xl font-extrabold">{plan.price} ريال</p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.limit}</p>
                <Button className="mt-5 w-full" variant={plan.name === "احترافية" ? "default" : "outline"}>
                  ضبط الخطة
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="soft-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole aria-hidden="true" />
              بوابات المستأجرين
            </CardTitle>
            <CardDescription>النطاقات، الحالة، وآخر نشاط.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[
              ["lumier", "نشط", "احترافية", "قبل 4 دقائق"],
              ["rose-touch", "تجربة مجانية", "أساسية", "قبل ساعة"],
              ["skoon-spa", "متأخر دفع", "متقدمة", "قبل يوم"],
            ].map(([slug, status, plan, last]) => (
              <div key={slug} className="rounded-lg border bg-background p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-bold">{slug}.platform.com</p>
                  <Badge variant={status === "نشط" ? "default" : "secondary"}>{status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan} · آخر نشاط {last}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="soft-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 aria-hidden="true" />
            مفاتيح ميزات حسب الخطة
          </CardTitle>
          <CardDescription>التحكم المركزي في الولاء، الهدايا، الدفع، الحملات، والفروع.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {["الدفع الإلكتروني", "نقاط الولاء", "بطاقات الهدايا", "حملات واتساب", "فروع متعددة"].map(
            (feature, index) => (
              <div key={feature} className="rounded-lg border bg-background p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-bold">{feature}</p>
                  <span
                    className={cn(
                      "h-6 w-11 rounded-full p-1 transition",
                      index < 4 ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "block size-4 rounded-full bg-white transition",
                        index < 4 ? "translate-x-0" : "-translate-x-5"
                      )}
                    />
                  </span>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  {index < 4 ? "مفعل للخطط الأعلى" : "مقيد بالمتقدمة"}
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileBenefit({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <Card className="soft-shadow">
      <CardContent className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-heading text-xl font-extrabold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-md bg-background text-primary ring-1 ring-border">
        <Icon aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-bold text-muted-foreground">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3 text-center">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-xl font-extrabold">{value}</p>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-2">
      <dt className="font-bold text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{value}</dd>
    </div>
  );
}

function GiftIcon() {
  return <Sparkles data-icon="inline-start" aria-hidden="true" />;
}

function AreaTrendChart() {
  const width = 640;
  const height = 250;
  const padding = { top: 18, right: 26, bottom: 42, left: 18 };
  const values = revenueData.map((point) => point.revenue);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(max - min, 1);
  const plotWidth = width - padding.right - padding.left;
  const plotHeight = height - padding.top - padding.bottom;
  const points = revenueData.map((point, index) => {
    const x = padding.left + (plotWidth / (revenueData.length - 1)) * index;
    const y = padding.top + plotHeight - ((point.revenue - min) / span) * plotHeight;
    return { ...point, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = [
    `${points[0].x},${padding.top + plotHeight}`,
    ...points.map((point) => `${point.x},${point.y}`),
    `${points[points.length - 1].x},${padding.top + plotHeight}`,
  ].join(" ");

  return (
    <svg
      className="h-full w-full overflow-visible"
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>اتجاه الإيرادات الأسبوعية</title>
      {[0, 1, 2, 3].map((lineIndex) => {
        const y = padding.top + (plotHeight / 3) * lineIndex;
        return (
          <line
            key={lineIndex}
            stroke="hsl(var(--border))"
            strokeDasharray="5 5"
            strokeWidth="1"
            x1={padding.left}
            x2={width - padding.right}
            y1={y}
            y2={y}
          />
        );
      })}
      <polygon fill="hsl(var(--primary) / 0.16)" points={area} />
      <polyline fill="none" points={line} stroke="hsl(var(--primary))" strokeWidth="4" />
      {points.map((point) => (
        <g key={point.day}>
          <circle cx={point.x} cy={point.y} fill="hsl(var(--card))" r="5" stroke="hsl(var(--primary))" strokeWidth="3" />
          <text
            fill="hsl(var(--muted-foreground))"
            fontSize="13"
            textAnchor="middle"
            x={point.x}
            y={height - 16}
          >
            {point.day}
          </text>
        </g>
      ))}
    </svg>
  );
}

function BookingsBarChart() {
  const max = Math.max(...revenueData.map((point) => point.bookings));

  return (
    <div className="flex h-full items-end gap-3 rounded-lg border bg-muted/30 p-4">
      {revenueData.map((point) => (
        <div key={point.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex h-52 w-full items-end rounded-md bg-background">
            <div
              className="w-full rounded-t-md bg-primary"
              style={{ height: `${(point.bookings / max) * 100}%` }}
            />
          </div>
          <span className="truncate text-xs font-bold text-muted-foreground">{point.day}</span>
          <span className="text-xs text-primary">{point.bookings}</span>
        </div>
      ))}
    </div>
  );
}
