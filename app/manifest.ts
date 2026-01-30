import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'F_Junior Portfolio',
        short_name: 'F_Junior',
        description: 'Portfolio de FOKO TADJUIGE B. JUNIOR, développeur Full Stack & IA',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/logo.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
