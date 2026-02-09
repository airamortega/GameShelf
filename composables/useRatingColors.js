// composables/useRatingColors.js
export const useRatingColors = () => {
    const getRatingClasses = (r) => {
        if (!r && r !== 0) return 'bg-gray-500 text-white';

        switch (true) {
            case (r >= 90): return 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50';
            case (r >= 80): return 'bg-green-500 text-white';
            case (r >= 70): return 'bg-lime-500 text-black';
            case (r >= 60): return 'bg-yellow-400 text-black';
            case (r >= 50): return 'bg-yellow-600 text-white';
            case (r >= 40): return 'bg-orange-400 text-black';
            case (r >= 30): return 'bg-orange-600 text-white';
            case (r >= 20): return 'bg-red-500 text-white';
            case (r >= 10): return 'bg-red-700 text-white';
            default: return 'bg-red-900 text-white';
        }
    };

    return { getRatingClasses };
}