import { useEffect, useState } from 'react';

const useKonamiCode = (targetSequence) => {
  const [isMatch, setIsMatch] = useState(false);
  const [input, setInput] = useState([]);

  // Sequência padrão: Cima, Cima, Baixo, Baixo, Esquerda, Direita, Esquerda, Direita, B, A
  const konamiCode = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];

  const sequence = targetSequence || konamiCode;

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { key } = e;
      
      // Adiciona a nova tecla ao array e mantém apenas o tamanho da sequência alvo
      const newInput = [...input, key].slice(-sequence.length);
      setInput(newInput);

      // Compara os arrays
      if (JSON.stringify(newInput) === JSON.stringify(sequence)) {
        setIsMatch(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, sequence]);

  return isMatch;
};

export default useKonamiCode;
