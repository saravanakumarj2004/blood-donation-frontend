/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#F75369', // Red Main
                    50: '#FFF3F4', // Red Light
                    100: '#FFE1E4',
                    200: '#FFC2C8',
                    300: '#FFA3AC',
                    400: '#F97486',
                    500: '#F75369',
                    600: '#D43E52', // Red Dark
                    700: '#B33040',
                    800: '#902432',
                    900: '#701B27',
                    950: '#4A1019',
                    hover: '#D43E52',
                },
                red: {
                    DEFAULT: '#F75369',
                    50: '#FFF3F4',
                    100: '#FFE1E4',
                    200: '#FFC2C8',
                    300: '#FFA3AC',
                    400: '#F97486',
                    500: '#F75369',
                    600: '#D43E52',
                    700: '#B33040',
                    800: '#902432',
                    900: '#701B27',
                    950: '#4A1019',
                    hover: '#D43E52',
                },
                secondary: {
                    DEFAULT: '#1E40AF', // Base
                    50: '#E3F2FD',
                    100: '#BBDEFB',
                    200: '#90CAF9',
                    300: '#64B5F6',
                    400: '#42A5F5',
                    500: '#2196F3',
                    600: '#1E88E5',
                    700: '#1976D2',
                    800: '#1E40AF', // Main
                    900: '#1565C0',
                    950: '#0D47A1',
                    hover: '#1565C0',
                },
                success: {
                    DEFAULT: '#16A34A',
                    50: '#F0FDF4',
                    100: '#DCFCE7',
                    400: '#4ADE80',
                },
                warning: '#F59E0B',
                error: '#DC2626',
                // New Neutral System (Zinc)
                neutral: {
                    50: '#FAFAFA',
                    100: '#F4F4F5',
                    200: '#E4E4E7',
                    300: '#D4D4D8',
                    400: '#A1A1AA',
                    500: '#71717A', // Text
                    600: '#52525B', // Text
                    700: '#3F3F46', // Text
                    800: '#27272A', // Headings
                    900: '#18181B', // Headings
                    950: '#09090B',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}
