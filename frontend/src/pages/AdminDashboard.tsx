// src/pages/Admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';

interface Service {
  id: number;
  name: string;
  description: string;
  status: string;
  updated_at: string;
}

const AdminDashboard: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/services/', { credentials: 'include' })
      .then(res => res.json())
      .then((data: Service[]) => {
        setServices(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching services:', error);
        setLoading(false);
      });
  }, []);

  const updateServiceStatus = (serviceId: number, newStatus: string) => {
    fetch(`http://localhost:8000/api/services/${serviceId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    })
      .then(res => res.json())
      .then((updatedService: Service) => {
        setServices(prev =>
          prev.map(service =>
            service.id === updatedService.id ? updatedService : service
          )
        );
      })
      .catch(error => console.error('Error updating service:', error));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      {loading ? (
        <p>Loading services...</p>
      ) : (
        services.map(service => (
          <div key={service.id} className="p-4 border rounded shadow mb-4">
            <h2 className="text-xl font-semibold">{service.name}</h2>
            <p>{service.description}</p>
            <div className="flex items-center space-x-4">
              <span>
                <strong>Status:</strong> {service.status}
              </span>
              <select
                value={service.status}
                onChange={e => updateServiceStatus(service.id, e.target.value)}
                className="border p-1"
              >
                <option value="operational">Operational</option>
                <option value="degraded">Degraded Performance</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
