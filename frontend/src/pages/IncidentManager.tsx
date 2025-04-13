import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  getIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
  getServices,
} from "@/lib/api";

type Service = {
  id: number;
  name: string;
};

type Incident = {
  id: number;
  title: string;
  description: string;
  status: string;
  affected_services: number[];
};

const statusOptions = [
  { value: "investigating", label: "Investigating" },
  { value: "identified", label: "Identified" },
  { value: "monitoring", label: "Monitoring" },
  { value: "resolved", label: "Resolved" },
];

export default function IncidentManager() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "investigating",
    affected_services: [] as string[],
  });

  useEffect(() => {
    fetchIncidents();
    fetchServices();
  }, []);

  const fetchIncidents = async () => {
    const res = await getIncidents();
    console.log("getIncidents response:", res.data);

    // Adjust based on actual API response structure
    const incidentArray = Array.isArray(res.data)
      ? res.data
      : res.data.incidents;
    setIncidents(incidentArray || []);
  };

  const fetchServices = async () => {
    const res = await getServices();
    setServices(res.data);
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      affected_services: form.affected_services.map(Number),
    };

    if (editingId) {
      await updateIncident(editingId, payload);
      setEditingId(null);
    } else {
      await createIncident(payload);
    }

    setForm({
      title: "",
      description: "",
      status: "investigating",
      affected_services: [],
    });
    fetchIncidents();
  };

  const handleEdit = (incident: Incident) => {
    setForm({
      title: incident.title,
      description: incident.description,
      status: incident.status,
      affected_services: incident.affected_services.map(String),
    });
    setEditingId(incident.id);
  };

  const handleDelete = async (id: number) => {
    await deleteIncident(id);
    fetchIncidents();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        {editingId ? "Edit Incident" : "Create Incident"}
      </h1>

      <Card className="p-6 space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <Label>Status</Label>
          <div className="flex gap-4 flex-wrap">
            {statusOptions.map((s) => (
              <label key={s.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="status"
                  value={s.value}
                  checked={form.status === s.value}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label>Affected Services</Label>
          <MultiSelect
            options={services.map((s) => ({
              value: s.id.toString(),
              label: s.name,
            }))}
            selected={form.affected_services}
            onChange={(vals) => setForm({ ...form, affected_services: vals })}
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSubmit}>
            {editingId ? "Update Incident" : "Create Incident"}
          </Button>
          {editingId && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setForm({
                  title: "",
                  description: "",
                  status: "investigating",
                  affected_services: [],
                });
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        {Array.isArray(incidents) &&
          incidents.map((i) => (
            <Card key={i.id} className="p-4 space-y-1">
              <h2 className="font-semibold text-lg">{i.title}</h2>
              <p className="text-sm">{i.description}</p>
              <p className="text-sm text-muted-foreground">
                Status: {i.status}
              </p>
              <p className="text-sm">
                Affected:{" "}
                {i.affected_services
                  .map((id) => services.find((s) => s.id === id)?.name || id)
                  .join(", ")}
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(i)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(i.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}
