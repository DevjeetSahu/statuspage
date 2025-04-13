import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "@/lib/api";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Service = {
  id: number;
  name: string;
  description: string;
  status: string;
  last_updated: string;
};

const statusOptions = [
  { value: "operational", label: "Operational" },
  { value: "degraded", label: "Degraded Performance" },
  { value: "partial_outage", label: "Partial Outage" },
  { value: "major_outage", label: "Major Outage" },
];

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "operational",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchServices = async () => {
    const res = await getServices();
    setServices(res.data);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async () => {
    if (!form.name) return;

    if (editingId) {
      await updateService(editingId, form);
      setEditingId(null);
    } else {
      await createService(form);
    }

    setForm({ name: "", description: "", status: "operational" });
    fetchServices();
  };

  const handleEdit = (service: Service) => {
    setForm({
      name: service.name,
      description: service.description,
      status: service.status,
    });
    setEditingId(service.id);
  };

  const handleDelete = async (id: number) => {
    await deleteService(id);
    fetchServices();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">
        {editingId ? "Edit Service" : "Create Service"}
      </h1>

      <Card className="p-4 space-y-3">
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Label>Description</Label>
        <Input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Label>Status</Label>
        <RadioGroup
          value={form.status}
          onValueChange={(value) => setForm({ ...form, status: value })}
          className="flex flex-wrap gap-4"
        >
          {statusOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex gap-2">
          <Button onClick={handleSubmit}>
            {editingId ? "Update Service" : "Create Service"}
          </Button>
          {editingId && (
            <Button
              variant="ghost"
              onClick={() => {
                setForm({ name: "", description: "", status: "operational" });
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        {services.map((s) => (
          <Card key={s.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-muted-foreground">{s.description}</p>
              <p className="text-sm">
                Status: <strong>{s.status}</strong>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleEdit(s)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(s.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
