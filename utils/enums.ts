export const GameStatus = {
    PENDIENTE: 'Pendiente',
    JUGANDO: 'Jugando',
    TERMINADO: 'Terminado',
    ABANDONADO: 'Abandonado'
} as const;

export type GameStatusType = typeof GameStatus[keyof typeof GameStatus];

// Helper para colores o etiquetas bonitas
export const GameStatusLabels = {
    [GameStatus.PENDIENTE]: { label: 'Pendiente', color: '#facc15' },
    [GameStatus.JUGANDO]: { label: 'Jugando', color: '#38bdf8' },
    [GameStatus.TERMINADO]: { label: 'Terminado', color: '#4ade80' },
    [GameStatus.ABANDONADO]: { label: 'Abandonado', color: '#94a3b8' },
};