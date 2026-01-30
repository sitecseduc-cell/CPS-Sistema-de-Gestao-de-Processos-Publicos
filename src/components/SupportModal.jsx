import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '../supabaseClient';

// Cole o SupportModal que estava no App.jsx
const SupportModal = ({ isOpen, setIsOpen, user }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !message) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('support_tickets').insert({
        description: message,
        subject: "Ticket de Suporte",
        user_id: user.id,
        priority: "Média",
        status: "Aberto"
      });

      if (error) throw error;

      setIsSubmitting(false);
      setMessage('');
      setIsOpen(false);
      alert('Ticket de suporte enviado com sucesso!');
    } catch (error) {
      console.error("Erro ao enviar ticket:", error);
      setIsSubmitting(false);
      alert('Erro ao enviar ticket. Tente novamente.');
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
                  Contatar Suporte
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Descreva seu problema, solicitação ou feedback. Nossa equipe de suporte (Perfil: Suporte) receberá sua mensagem.
                  </p>
                  <div>
                    <label htmlFor="support-message" className="sr-only">Sua Mensagem</label>
                    <textarea
                      id="support-message"
                      name="message"
                      rows="5"
                      className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Digite sua mensagem aqui..."
                      required
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
                      disabled={isSubmitting || !message}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Ticket'}
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

export default SupportModal;