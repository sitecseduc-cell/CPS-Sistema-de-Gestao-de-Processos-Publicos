import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";

export default function OnboardingTour() {
    useEffect(() => {
        // Verifica se já viu o tour
        const hasSeenTour = localStorage.getItem('cps_tour_completed');

        if (!hasSeenTour) {
            const tourDriver = driver({
                showProgress: true,
                animate: true,
                allowClose: true,
                doneBtnText: "Concluir",
                nextBtnText: "Próximo",
                prevBtnText: "Voltar",
                popoverClass: 'driverjs-theme', // Custom class para estilizar se precisar
                steps: [
                    {
                        element: '#sidebar-nav',
                        popover: {
                            title: 'Navegação Principal',
                            description: 'Aqui você acessa todos os módulos do sistema, como Processos, Vagas e Relatórios.'
                        }
                    },
                    {
                        element: '#kpi-cards',
                        popover: {
                            title: 'Indicadores em Tempo Real',
                            description: 'Acompanhe os números mais importantes da sua gestão num piscar de olhos.'
                        }
                    },
                    {
                        element: '#quick-actions',
                        popover: {
                            title: 'Ações Rápidas',
                            description: 'Inicie novos processos ou configure vagas com apenas um clique.'
                        }
                    },
                    {
                        element: '#chatbot-trigger',
                        popover: {
                            title: 'IA Assistente',
                            description: 'Dúvidas? Nossa Inteligência Artificial está pronta para ajudar a qualquer momento.'
                        }
                    }
                ],
                onDestroyed: () => {
                    // Salva que o usuário já viu o tour para não abrir de novo
                    localStorage.setItem('cps_tour_completed', 'true');
                }
            });

            // Pequeno delay para garantir que a UI carregou
            setTimeout(() => {
                tourDriver.drive();
            }, 1500);
        }
    }, []);

    return null; // Componente lógico, não renderiza nada visualmente por si só
}
