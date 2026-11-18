import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Foko Junior (F_Junior) — Portfolio',
        short_name: 'Foko Junior',
        description: 'Portfolio de Foko Junior (FOKO TADJUIGE Benoît Junior, F_Junior), développeur Full Stack Web · Mobile · IA · DevOps à Douala',
        start_url: '/',
        display: 'standalone',
        background_color: '#f4f6fa',
        theme_color: '#11151d',
        icons: [
            {
                src: '/logo.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
