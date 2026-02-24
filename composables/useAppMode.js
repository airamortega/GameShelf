export const useAppMode = () => {
    const mode = useState('app_mode', () => 'manga');

    const setMode = (newMode) => {
        mode.value = newMode;
    };

    return { mode, setMode };
};