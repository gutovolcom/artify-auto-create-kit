// src/hooks/usePersistentState.ts

import { useState, useEffect } from 'react';

// Este hook funciona como o useState, mas com um superpoder:
// ele salva automaticamente o estado no localStorage do navegador.
export function usePersistentState<T>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storageValue = localStorage.getItem(key);
      // Se encontrarmos algo no localStorage, usamos isso.
      // Senão, usamos o estado inicial que foi passado.
      return storageValue ? JSON.parse(storageValue) : initialState;
    } catch (error) {
      // Em caso de erro (ex: JSON inválido), voltamos para o estado inicial.
      console.error(`Erro ao ler do localStorage para a chave "${key}":`, error);
      return initialState;
    }
  });

  useEffect(() => {
    // Toda vez que o estado mudar, nós o salvamos no localStorage.
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Erro ao salvar no localStorage para a chave "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}