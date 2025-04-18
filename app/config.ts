interface Config {
  unsplashAccessKey: string;
  groqApiKey: string;
}

const config: Config = {
  unsplashAccessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
};

export default config;
