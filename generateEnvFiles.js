import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const envs = [
    {
        name: '.env.development',
        content: [
            '# Environment variables file for development',
            '# DO NOT commit this file to version control (Git)',
            'VITE_API_URL=YOUR_API_URL_HERE',
            'VITE_UNSPLASH_KEY=YOUR_UNSPLASH_KEY_HERE',
            'VITE_PEXELS_KEY=YOUR_PEXELS_KEY_HERE',
            'VITE_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY_HERE',
            '# Add other development-specific variables here if you have any',
            'VITE_DEBUG_MODE=true',
        ],
    },
];

envs.forEach(({ name, content }) => {
    const filePath = join(__dirname, name);

    if (existsSync(filePath)) {
        console.warn(`⚠️ The file ${name} already exists. It will not be overwritten.`);
        console.warn('   If you need to update it, please delete it manually and run the script again.');
    } else {
        try {
            writeFileSync(filePath, content.join('\n'));
            console.log(`✅ File ${name} generated successfully.`);
            console.log(`   Remember to fill in the API keys and any other necessary variables in ${name}!`);
        } catch (error) {
            console.error(`❌ Error generating ${name}:`, error);
        }
    }
    console.log('----------------------------------------------------');
});

console.log('Finished generating .env files.');