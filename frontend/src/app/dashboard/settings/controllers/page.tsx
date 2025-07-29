'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ControllerModal } from '@/components/ControllerModal';
import { Controller, CreateControllerDto } from '@/contexts/DashboardContext/types/controller/Controller.type';

export default function ControllersSettingsPage() {
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [controllersLoading, setControllersLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingController, setEditingController] = useState<Controller | undefined>();
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    loadControllers();
  }, []);

  const loadControllers = async () => {
    const response = await fetch('/api/settings/controllers');
    const data = await response.json();
    setControllers(data);
    setControllersLoading(false);
  };

  const handleAddController = () => {
    setEditingController(undefined);
    setModalTitle('Adicionar Controlador');
    setIsModalOpen(true);
  };

  const handleEditController = (controller: Controller) => {
    setEditingController(controller);
    setModalTitle('Editar Controlador');
    setIsModalOpen(true);
  };

  const handleDeleteController = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este controlador?')) {
      fetch(`/api/settings/controllers`, {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      }).then(() => {
        loadControllers();
      });
    }
  };

  const handleSubmitController = (data: CreateControllerDto) => {
    if (editingController) {
      // Editar controlador existente
      setControllers(controllers.map(c =>
        c.id === editingController.id
          ? { ...c, ...data }
          : c
      ));
    } else {
      // Adicionar novo controlador
      const newController: Controller = {
        id: Date.now().toString(),
        ...data,
        status: 'offline',
        endpoints: []
      };
      setControllers([...controllers, newController]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingController(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações dos Controladores</h1>
        <Button onClick={handleAddController} className="bg-blue-600 hover:bg-blue-700">
          + Adicionar Controlador
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endereço
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {controllers.map((controller) => (
                <tr key={controller.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {controller.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {controller.driverName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {controller.host}:{controller.port}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center">
                      <div className={`w-3 h-3 rounded-full ${controller.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={() => handleEditController(controller)}
                        className="text-blue-600 hover:text-blue-900 bg-transparent p-0 h-auto"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDeleteController(controller.id)}
                        className="text-red-600 hover:text-red-900 bg-transparent p-0 h-auto"
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {controllers.length === 0 && !controllersLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum controlador configurado</p>
            <Button
              onClick={handleAddController}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
            >
              Adicionar Primeiro Controlador
            </Button>
          </div>
        )}

        {controllersLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando controladores...</p>
          </div>
        )}
      </div>

      {isModalOpen && <ControllerModal
        onClose={handleCloseModal}
        onSubmit={handleSubmitController}
        controller={editingController}
        title={modalTitle}
      />}
    </div>
  );
} 