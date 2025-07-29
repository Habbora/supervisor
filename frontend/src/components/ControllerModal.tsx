'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Controller, CreateControllerDto } from '@/contexts/DashboardContext/types/controller/Controller.type';

// Lista de drivers disponíveis
const availableDrivers = [
  'modbus_tcp',
  'modbus_rtu',
];

interface ControllerModalProps {
  onClose: () => void;
  onSubmit: (controller: CreateControllerDto) => void;
  controller?: Controller;
  title: string;
}

export function ControllerModal({
  onClose, 
  onSubmit, 
  controller, 
  title 
}: ControllerModalProps) {
  const [formData, setFormData] = useState<CreateControllerDto>({
    name: controller?.name || '',
    driverName: controller?.driverName || '',
    host: controller?.host || '',
    port: controller?.port || 502,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Controlador</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: CLP1"
              required
            />
          </div>

          <div>
            <Label htmlFor="driverName">Driver</Label>
            <select
              id="driverName"
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione um driver</option>
              {availableDrivers.map((driver) => (
                <option key={driver} value={driver}>
                  {driver}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="host">Endereço IP</Label>
            <Input
              id="host"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              placeholder="Ex: 192.168.0.240"
              required
            />
          </div>

          <div>
            <Label htmlFor="port">Porta</Label>
            <Input
              id="port"
              type="number"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
              placeholder="502"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
            <Button type="button" onClick={onClose} className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 