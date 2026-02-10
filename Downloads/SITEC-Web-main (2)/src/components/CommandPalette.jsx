import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Combobox, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { toggleTheme } = useTheme();

    // Atalho de teclado (Ctrl+K ou Cmd+K)
    useEffect(() => {
        const onKeydown = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };
        window.addEventListener('keydown', onKeydown);
        return () => window.removeEventListener('keydown', onKeydown);
    }, []);

    const commands = [
        { id: 'home', name: 'Ir para Dashboard', icon: 'home', action: () => navigate('/dashboard') },
        { id: 'process', name: 'Novo Processo', icon: 'plus-circle', action: () => navigate('/dashboard/processos/novo') },
        { id: 'list', name: 'Listar Processos', icon: 'list', action: () => navigate('/dashboard/processos') },
        { id: 'theme', name: 'Alternar Tema Claro/Escuro', icon: 'moon', action: () => toggleTheme() },
        { id: 'help', name: 'Central de Ajuda', icon: 'help-circle', action: () => navigate('/dashboard/ajuda') },
    ];

    const filteredCommands = query === ''
        ? commands
        : commands.filter((cmd) => cmd.name.toLowerCase().includes(query.toLowerCase()));

    const execute = (command) => {
        setIsOpen(false);
        command.action();
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog onClose={setIsOpen} className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[25vh]">
                <Transition.Child
                    enter="duration-300 ease-out"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="duration-200 ease-in"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Dialog.Overlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
                </Transition.Child>

                <Transition.Child
                    enter="duration-300 ease-out"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="duration-200 ease-in"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <Combobox onChange={execute} as="div" className="relative mx-auto max-w-xl overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 divide-y divide-gray-100 dark:divide-gray-700">
                        <div className="flex items-center px-4">
                            <Icon name="search" className="h-6 w-6 text-gray-500" />
                            <Combobox.Input
                                onChange={(event) => setQuery(event.target.value)}
                                className="h-12 w-full border-0 bg-transparent pl-4 pr-4 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-0 sm:text-sm"
                                placeholder="O que você precisa? (Busque por processos, navegação...)"
                                autoComplete="off"
                            />
                        </div>

                        {filteredCommands.length > 0 && (
                            <Combobox.Options static className="max-h-96 scroll-py-3 overflow-y-auto p-3">
                                {filteredCommands.map((item) => (
                                    <Combobox.Option
                                        key={item.id}
                                        value={item}
                                        className={({ active }) =>
                                            `flex cursor-pointer select-none rounded-xl p-3 text-sm transition-colors ${active ? 'bg-indigo-500 text-white' : 'text-gray-700 dark:text-gray-200'
                                            }`
                                        }
                                    >
                                        {({ active }) => (
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                    <Icon name={item.icon} className="h-5 w-5" />
                                                </div>
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                        )}
                                    </Combobox.Option>
                                ))}
                            </Combobox.Options>
                        )}

                        {query !== '' && filteredCommands.length === 0 && (
                            <p className="p-4 text-sm text-gray-500 text-center">Nenhum comando encontrado.</p>
                        )}
                    </Combobox>
                </Transition.Child>
            </Dialog>
        </Transition.Root>
    );
}
