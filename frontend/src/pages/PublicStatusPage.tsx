// src/pages/Public/PublicStatusPage.tsx
import React, { useEffect, useState } from 'react';

interface Service {
  id: number;
  name: string;
  description: string;
  status: string;
  updated_at: string;
}

const PublicStatusPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/services/')
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Service Status</h1>
      {loading ? (
        <p>Loading services...</p>
      ) : (
        <div className="grid gap-4">
          {services.map(service => (
            <div key={service.id} className="p-4 border rounded shadow">
              <h2 className="text-xl font-semibold">{service.name}</h2>
              <p>{service.description}</p>
              <p className="mt-2">
                <strong>Status:</strong> {service.status}
              </p>
              <p className="text-sm text-gray-500">
                Updated at: {new Date(service.updated_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicStatusPage;
