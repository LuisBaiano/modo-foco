import { useCallback, useState } from 'react';

/**
 * Estado de seleção múltipla pra listas com exclusão em lote (toque longo
 * entra no modo seleção, toque simples alterna item). Genérico o bastante
 * pra qualquer lista com id numérico — reaproveitado em Tarefas, Estudos e
 * Saúde.
 */
export function useSelection() {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const isSelecting = selected.size > 0;

  const start = useCallback((id: number) => {
    setSelected(new Set([id]));
  }, []);

  const toggle = useCallback((id: number) => {
    setSelected(current => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelected(new Set());
  }, []);

  return { selected, isSelecting, start, toggle, clear };
}
