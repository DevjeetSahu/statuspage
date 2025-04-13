import { useEffect, useMemo, useState } from "react";
import { getServices, getIncidents } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Service = {
  id: number;
  name: string;
  description: string;
  status: string;
};

type Incident = {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  affected_services: number[];
};

const statusStyles = {
  operational: {
    label: "Operational",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle className="w-4 h-4 text-green-600" />,
  },
  degraded: {
    label: "Degraded",
    color: "bg-yellow-100 text-yellow-800",
    icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
  },
  partial_outage: {
    label: "Partial Outage",
    color: "bg-orange-100 text-orange-800",
    icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
  },
  major_outage: {
    label: "Major Outage",
    color: "bg-red-100 text-red-700",
    icon: <AlertOctagon className="w-4 h-4 text-red-600" />,
  }
};

const pieColors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6"];

export default function ServiceStatusPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [incidentSearch, setIncidentSearch] = useState("");

  useEffect(() => {
    getServices().then((res) => setServices(res.data));
    getIncidents().then((res) => {
      const list = Array.isArray(res.data) ? res.data : res.data.incidents;
      setIncidents(list);
    });
  }, []);

  useEffect(() => {
    const socket = new WebSocket(`${import.meta.env.VITE_WS_URL}`);

    socket.onopen = () => console.log("✅ WebSocket connected");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Received update:", data);

      if (data.model === "service") {
        // service handling logic (already there)
        setServices((prev) => {
          if (data.event === "created") {
            const exists = prev.find((s) => s.id === data.service_id);
            if (!exists) {
              return [
                ...prev,
                {
                  id: data.service_id,
                  name: data.name,
                  description: data.description,
                  status: data.status,
                },
              ];
            }
            return prev;
          } else if (data.event === "updated") {
            return prev.map((s) =>
              s.id === data.service_id
                ? {
                    ...s,
                    status: data.status,
                    description: data.description,
                    name: data.name,
                  }
                : s
            );
          } else if (data.event === "deleted") {
            return prev.filter((s) => s.id !== data.service_id);
          }
          return prev;
        });
      }

      if (data.model === "incident") {
        // 🆕 incident handling logic
        setIncidents((prev) => {
          if (data.event === "created") {
            const exists = prev.find((i) => i.id === data.incident_id);
            if (!exists) {
              return [
                ...prev,
                {
                  id: data.incident_id,
                  title: data.title,
                  description: data.description,
                  status: data.status,
                  created_at: data.created_at,
                  updated_at: data.updated_at,
                  affected_services: data.affected_services || [],
                },
              ];
            }
            return prev;
          } else if (data.event === "updated") {
            return prev.map((i) =>
              i.id === data.incident_id
                ? {
                    ...i,
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    updated_at: data.updated_at,
                  }
                : i
            );
          } else if (data.event === "deleted") {
            return prev.filter((i) => i.id !== data.incident_id);
          }
          return prev;
        });
      }
    };

    socket.onerror = (error) => console.error("❌ WebSocket error:", error);
    socket.onclose = () => console.log("🔌 WebSocket closed");

    return () => socket.close();
  }, []);


  const activeIncidents = incidents.filter((i) => i.status !== "resolved");

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter ? s.status === filter : true;
      return matchesSearch && matchesFilter;
    });
  }, [services, search, filter]);

   const filteredIncidents = useMemo(() => {
     return incidents.filter((i) => {
       return (
         i.title.toLowerCase().includes(incidentSearch.toLowerCase()) ||
         i.description.toLowerCase().includes(incidentSearch.toLowerCase())
       );
     });
   }, [incidents, incidentSearch]);

  // Incident frequency per day
  const incidentByDate = useMemo(() => {
    const now = new Date();
    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 29);

    const map: Record<string, number> = {};

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const formatted = date.toISOString().split("T")[0];
      map[formatted] = 0;
    }

    incidents.forEach((incident) => {
      const dateObj = new Date(incident.created_at);
      if (dateObj >= last30Days) {
        const date = dateObj.toISOString().split("T")[0];
        map[date] = (map[date] || 0) + 1;
      }
    });

    return Object.entries(map)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, count]) => ({ date, count }));
  }, [incidents]);


  // Status distribution
  const statusDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    incidents.forEach((i) => {
      map[i.status] = (map[i.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, value]) => ({
      name: status,
      value,
    }));
  }, [incidents]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">
          Service Status
        </h1>
        <p className="text-muted-foreground text-sm">
          Live status updates powered by WebSockets
        </p>
      </header>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center w-full md:max-w-sm gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(statusStyles).map(([key, val]) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              onClick={() => setFilter(filter === key ? "" : key)}
              className="text-xs"
            >
              {val.icon}
              {val.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Services */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">All Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredServices.map((s) => (
            <Card
              key={s.id}
              className="p-5 rounded-2xl border hover:shadow-md transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {s.description}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
                    statusStyles[s.status as keyof typeof statusStyles]?.color
                  )}
                >
                  {statusStyles[s.status as keyof typeof statusStyles]?.icon}
                  {statusStyles[s.status as keyof typeof statusStyles]?.label ??
                    s.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Active Incidents */}
      {activeIncidents.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Active Incidents</h2>
          <div className="space-y-3">
            {activeIncidents.map((incident) => (
              <Card
                key={incident.id}
                className="p-5 rounded-xl border border-yellow-400/50 bg-yellow-100/40 backdrop-blur-sm animate-pulse"
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-md font-semibold">{incident.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {new Date(incident.created_at).toISOString().split('T')[0]}
                  </span>
                </div>
                <p className="text-sm">{incident.description}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Incident Timeline with Search */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Incident Timeline</h2>

        <Input
          placeholder="Search incidents..."
          value={incidentSearch}
          onChange={(e) => setIncidentSearch(e.target.value)}
          className="max-w-md mb-4"
        />

        <div className="space-y-3">
          {filteredIncidents
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 5)
            .map((incident) => (
              <Card
                key={incident.id}
                className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{incident.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(incident.created_at).toISOString().split('T')[0]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Status: {incident.status}
                </p>
              </Card>
            ))}
        </div>
      </section>

      {/* Historical Features for Incidents */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Incident Analytics</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart: Incident Frequency */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Incidents Per Day</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incidentByDate}>
                <XAxis dataKey="date" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Pie Chart: Status Distribution */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Incident Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusDistribution.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </section>
    </div>
  );
}
