export const PLATFORMS_LIST = [
    { id: 'steam', name: 'Steam', color: '#47a2ff', icon: '💻' },
    { id: 'gog', name: 'GOG', color: '#47a2ff', icon: '💻' },
    { id: 'ep', name: 'Epic Games', color: '#47a2ff', icon: '💻' },
    { id: 'ps5', name: 'PS5', color: '#003087', icon: '🎮' },
    { id: 'ps4', name: 'PS4', color: '#003789', icon: '🎮' },
    { id: 'ps3', name: 'PS3', color: '#003789', icon: '🎮' },
    { id: 'xbox_series', name: 'Xbox Series', color: '#107c10', icon: '💚' },
    { id: 'xbox_one', name: 'Xbox One', color: '#107c10', icon: '💚' },
    { id: 'xbox_360', name: 'Xbox 360', color: '#107c10', icon: '💚' },
    { id: 'switch', name: 'Switch', color: '#e60012', icon: '🔴' },
];

export const PlatformMap = Object.fromEntries(
    PLATFORMS_LIST.map(p => [p.id, p])
);