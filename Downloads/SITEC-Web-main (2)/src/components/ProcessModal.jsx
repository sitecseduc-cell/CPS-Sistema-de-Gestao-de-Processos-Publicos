import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '../supabaseClient';
import InputField from './InputField';
import SelectField from './SelectField';

// Cole o ProcessModal que estava no App.jsx
const ProcessModal = ({ isOpen, setIsOpen, process, user }) => {
  const [formData, setFormData] = useState({
    solicitante: '',
    status: 'Pendente',
    descricao: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = process !== null;
  const statusOptions = ["Pendente", "Em Análise", "Aprovado", "Rejeitado"];

  useEffect(() => {
    if (isEditing) {
      setFormData({
        solicitante: process.solicitante || '',
        status: process.status || 'Pendente',
        descricao: process.descricao || ''
      });
    } else {
      setFormData({
        solicitante: '',
        status: 'Pendente',
        descricao: ''
      });
    }
  }, [process, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    // Audit log skipped (schema limitation)
    /*
    const auditEntry = {
      action: isEditing ? "Alteração de Status" : "Criação de Processo",
      status: formData.status,
      user: user.username,
      userId: user.id,
      timestamp: new Date().toISOString()
    };
    */

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('processes')
          .update({
            title: formData.solicitante, // Using title as solicitante
            description: formData.descricao,
            status: formData.status
          })
          .eq('id', process.id);

        if (error) throw error;
      } else {
        const processId = "PROC-" + Date.now();
        const { error } = await supabase
          .from('processes')
          .insert({
            process_id: processId,
            title: formData.solicitante, // Using title as solicitante
            description: formData.descricao,
            status: formData.status,
            priority: "Média",
            category: "Geral",
            created_by: user.id,
            assigned_to: user.id, // Assign to creator initially
          });

        if (error) throw error;
      }
      setIsSubmitting(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao salvar processo:", error);
      setIsSubmitting(false);
      alert("Erro ao salvar processo.");
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        {/* ... (Todo o JSX do Modal permanece o mesmo) ... */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-white">
                  {isEditing ? 'Alterar Processo' : 'Registrar Novo Processo'}
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <InputField
                    id="solicitante"
                    name="solicitante"
                    label="Nome do Solicitante"
                    type="text"
                    value={formData.solicitante}
                    onChange={handleChange}
                    required
                  />
                  <SelectField
                    id="status"
                    name="status"
                    label="Status do Processo"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </SelectField>
                  <div>
                    <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição/Observações</label>
                    <textarea
                      id="descricao"
                      name="descricao"
                      rows="4"
                      className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
                      value={formData.descricao}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Salvando...' : 'Salvar Processo'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProcessModal;