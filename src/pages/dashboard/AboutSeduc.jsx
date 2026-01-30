import React from 'react';
import Icon from '../../components/Icon';

const AboutSeduc = () => {
  return (
    <div className="min-h-screen w-full -m-6 relative overflow-x-hidden">
      
      {/* IMAGEM DE FUNDO FIXA (Efeito Parallax) */}
      <div 
        className="fixed inset-0 z-0 bg-no-repeat bg-cover bg-center"
        style={{ 
          backgroundImage: "url('/seduc-building.png')",
          // Um overlay escuro para o texto ficar legível
          boxShadow: "inset 0 0 0 2000px rgba(0, 0, 0, 0.4)" 
        }}
      />

      {/* CONTEÚDO COM SCROLL */}
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Seção 1: Título Impactante */}
        <section className="h-screen flex flex-col justify-center items-center text-center p-8 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl">
            <Icon name="logo" className="w-20 h-20 text-white mb-6 mx-auto drop-shadow-lg" />
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-md">
              SEDUC
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-gray-200 font-light max-w-2xl">
              Transformando o futuro através da educação pública.
            </p>
          </div>
          <div className="absolute bottom-10 animate-bounce">
            <Icon name="arrowDown" className="w-8 h-8 text-white/70" />
          </div>
        </section>

        {/* Seção 2: História (Card Flutuante) */}
        <section className="min-h-[80vh] flex items-center justify-center p-6 w-full">
          <div className="max-w-4xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 md:p-16 shadow-2xl transform transition-all hover:scale-[1.01] duration-500">
            <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
              Nossa História
            </h2>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed text-justify">
              A Secretaria de Estado de Educação (SEDUC) não é apenas um órgão administrativo; é o coração do desenvolvimento intelectual do nosso estado. Desde a sua fundação, a SEDUC tem sido o pilar que sustenta milhares de escolas, garantindo que o conhecimento chegue aos cantos mais remotos. 
              <br /><br />
              Nascemos da necessidade de estruturar o ensino, mas crescemos com a missão de **humanizar a educação**. Passamos da era do papel para a era digital, enfrentando desafios logísticos e sociais, sempre com o objetivo de que nenhuma criança fique para trás.
            </p>
          </div>
        </section>

        {/* Seção 3: Missão e Futuro (Glassmorphism Claro) */}
        <section className="min-h-[80vh] flex items-center justify-center p-6 w-full">
          <div className="max-w-4xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-[3rem] p-10 md:p-16 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  O Que Fazemos?
                </h2>
                <ul className="space-y-4 text-gray-600 dark:text-gray-300 text-lg">
                  <li className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    Gestão de Rede Escolar
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Capacitação de Professores
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    Tecnologia Educacional (SITEC)
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    Inclusão e Acessibilidade
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur-lg opacity-75"></div>
                <div className="relative bg-gray-900 p-6 rounded-2xl text-white">
                  <p className="italic text-lg font-light">
                    "O SITEC é a prova viva da nossa evolução. Uma plataforma moderna que une dados, pessoas e processos para entregar uma educação mais eficiente."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Simples */}
        <footer className="w-full py-10 text-center text-white/50 bg-black/80 backdrop-blur-md">
          <p>© 2025 SEDUC - Secretaria de Estado de Educação.</p>
          <p className="text-sm mt-2">Desenvolvido com paixão pela equipe de TI.</p>
        </footer>

      </div>
    </div>
  );
};

export default AboutSeduc;
