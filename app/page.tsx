import MemeCreatorWrapper from './components/MemeCreatorWrapper';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-blue-100">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-4xl md:text-5xl font-comic text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 drop-shadow-lg animate-bounce">
          🌈 Nadine&apos;s Meme Maker 🌈
        </h1>
        <p className="text-center mb-8 font-comic text-purple-700 text-lg animate-pulse">
          Let&apos;s make some super fun memes! 🎉
        </p>
        <div className="max-w-2xl mx-auto">
          <MemeCreatorWrapper />
        </div>
      </div>
    </div>
  );
}
