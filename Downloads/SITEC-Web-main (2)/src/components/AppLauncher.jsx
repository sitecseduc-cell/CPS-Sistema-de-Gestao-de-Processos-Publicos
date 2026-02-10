import React, { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import Icon from './Icon';

const apps = [
    { name: 'SITEC Central', description: 'Gestão Unificada', icon: 'grid', color: 'bg-indigo-500', href: '#' },
    { name: 'Processos', description: 'Fluxo e Aprovações', icon: 'file-text', color: 'bg-blue-500', href: '/processos' },
    { name: 'Patrimônio', description: 'Gestão de Bens', icon: 'box', color: 'bg-emerald-500', href: '#' },
    { name: 'RH', description: 'Gestão de Pessoas', icon: 'users', color: 'bg-rose-500', href: '#' },
    { name: 'Financeiro', description: 'Contas e Repasses', icon: 'dollar-sign', color: 'bg-amber-500', href: '#' },
    { name: 'Acadêmico', description: 'Escolas e Alunos', icon: 'book', color: 'bg-violet-500', href: '#' },
];

const AppLauncher = () => {
    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button
                        className={`p-2 rounded-xl transition-all ${open ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'}`}
                    >
                        <Icon name="grid" className="w-6 h-6" />
                    </Popover.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel className="absolute right-0 z-50 mt-4 w-screen max-w-sm px-4 sm:px-0 lg:max-w-md transform">
                            <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 glass-card">
                                <div className="relative grid gap-4 bg-white/80 dark:bg-gray-900/80 p-6 grid-cols-2 lg:grid-cols-3">
                                    {apps.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className="-m-3 flex flex-col items-center justify-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition ease-in-out duration-150 group text-center"
                                        >
                                            <div className={`p-3 rounded-xl shadow-lg ${item.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                                                <Icon name={item.icon} className="w-6 h-6" />
                                            </div>
                                            <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                                                {item.name}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {item.description}
                                            </p>
                                        </a>
                                    ))}
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4">
                                    <a
                                        href="#"
                                        className="flow-root rounded-md px-2 py-2 transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                                    >
                                        <span className="flex items-center">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                Central de Ajuda
                                            </span>
                                        </span>
                                        <span className="block text-sm text-gray-500 dark:text-gray-400">
                                            Tutoriais e suporte técnico
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
};

export default AppLauncher;
