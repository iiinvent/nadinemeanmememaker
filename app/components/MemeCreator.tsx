'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { generateMemeText } from '../services/groq';

interface MemeCreatorProps {
  width: number;
  height: number;
}

export default function MemeCreator({ width, height }: MemeCreatorProps) {
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const drawMeme = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background image if available
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, width, height);
    } else {
      // Draw placeholder background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    // Function to wrap text
    const wrapText = (text: string, maxWidth: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    // Function to draw text with fun shadow effect
    const drawFunText = (text: string, x: number, y: number, isTop: boolean) => {
      if (!text) return;

      // Start with a large font size and decrease until it fits
      let fontSize = Math.min(64, Math.floor(width / 8));
      ctx.textAlign = 'center';
      
      // Keep adjusting font size until text fits
      let lines: string[] = [];
      do {
        ctx.font = `bold ${fontSize}px "Comic Sans MS"`;
        lines = wrapText(text, width * 0.9);
        fontSize -= 2;
      } while ((lines.length * fontSize * 1.2) > height * 0.25 && fontSize > 20);

      // Calculate total height of text block
      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      
      // Calculate starting Y position
      const startY = isTop ? y : y - totalHeight;
      if (!isTop) {
        ctx.textBaseline = 'top';
      }

      // Rainbow colors for outline
      const rainbow = [
        '#FF0000', // Red
        '#FF7F00', // Orange
        '#FFFF00', // Yellow
        '#00FF00', // Green
        '#0000FF', // Blue
        '#4B0082', // Indigo
        '#8B00FF'  // Violet
      ];

      // Draw each line
      lines.forEach((line, index) => {
        const lineY = startY + (index * lineHeight);

        // Draw rainbow outline
        rainbow.forEach((color, i) => {
          const offset = i * 2;
          ctx.lineWidth = Math.floor(fontSize / 6);
          ctx.strokeStyle = color;
          ctx.strokeText(line, x + offset - 6, lineY);
        });

        // Draw white fill with black outline
        ctx.lineWidth = Math.floor(fontSize / 4);
        ctx.strokeStyle = 'black';
        ctx.strokeText(line, x, lineY);
        ctx.fillStyle = 'white';
        ctx.fillText(line, x, lineY);
      });

      // No decorations
    };

    // Draw the text
    drawFunText(topText, width / 2, 40, true);
    drawFunText(bottomText, width / 2, height - 40, false);
  }, [backgroundImage, topText, bottomText, width, height]);

  useEffect(() => {
    drawMeme();
  }, [backgroundImage, topText, bottomText, drawMeme]);

  const handleImageSearch = async (query: string) => {
    if (!query.trim()) return;

    setError('');
    setIsLoading(true);

    try {
      // Clean up the query
      const cleanQuery = query.trim();
      
      // Get a random page number between 1 and 3 (since we increased perPage)
      const randomPage = Math.floor(Math.random() * 3) + 1;
      const response = await fetch(`/api/search-images?query=${encodeURIComponent(cleanQuery)}&page=${randomPage}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();

      if (data && data.results && data.results.length > 0) {
        // Get a random image from the results
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const photo = data.results[randomIndex];
        
        // Load the image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = photo.urls.regular;
        
        img.onload = () => {
          setBackgroundImage(img);
          setIsLoading(false);
        };

        img.onerror = () => {
          setError('Failed to load image. Please try again!');
          setIsLoading(false);
        };
      } else {
        setError('No images found. Try a different search!');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error searching for images:', error);
      setError('Error searching for images. Please try again!');
      setIsLoading(false);
    }
  };


  const handleAIGenerate = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const memeText = await generateMemeText(searchQuery || 'random meme');
      setTopText(memeText.topText);
      setBottomText(memeText.bottomText);
    } catch {
      setError('Failed to generate text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `meme-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 min-h-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNGRkYiIG9wYWNpdHk9IjAuMiIvPgo8L3N2Zz4=')] bg-gradient-to-b from-pink-200 via-purple-200 to-blue-200">
      <div className="w-full max-w-md space-y-6 relative px-4 sm:px-0">
        
        <div className="relative z-10 space-y-4">
          {/* Search Section */}
          <div className="relative group">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="🔍 What kind of picture do you want?"
                className="w-full p-4 sm:p-6 text-lg sm:text-xl border-4 border-dashed border-purple-400 rounded-3xl font-comic bg-white shadow-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-300 transform transition-all hover:scale-102 placeholder-purple-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleImageSearch(searchQuery)}
              />
              <button
                onClick={() => handleImageSearch(searchQuery)}
                className="w-full sm:w-auto px-6 py-4 sm:py-6 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-3xl font-comic text-lg sm:text-xl shadow-xl hover:shadow-2xl hover:from-blue-500 hover:to-blue-600 transform hover:scale-105 transition-all disabled:opacity-50 disabled:transform-none relative overflow-hidden group whitespace-nowrap"
                disabled={isLoading || !searchQuery}
              >
                <span className="relative z-10">
                  {isLoading ? '🔄' : '🔍 Search!'}
                </span>
              </button>
            </div>

          </div>

          {/* Upload Section */}
          <div className="relative group">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                      setBackgroundImage(img);
                      setError('');
                    };
                    img.onerror = () => setError('Failed to load image');
                    img.src = event.target?.result as string;
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 sm:p-6 bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-3xl font-comic text-lg sm:text-xl shadow-xl hover:shadow-2xl hover:from-green-500 hover:to-teal-600 transform hover:scale-105 transition-all relative overflow-hidden group"
            >
              <span className="relative z-10">📸 Upload Your Own Picture!</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-100 border-4 border-red-300 rounded-3xl font-comic text-red-600 text-center text-lg animate-bounce">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        )}

        <div className="relative group transform transition-all hover:scale-102">
          <div className="absolute -inset-3 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-3xl blur opacity-30 group-hover:opacity-40 transition-all"></div>
          <div className="relative border-4 border-dashed border-purple-400 rounded-3xl p-3 bg-white shadow-xl">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="w-full rounded-2xl"
            />
            {!backgroundImage && (
              <div className="absolute inset-0 flex items-center justify-center text-purple-400 font-comic text-xl text-center p-6 animate-pulse">
                🎨 Let&apos;s create something AWESOME! ✨
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="🌈 Type your TOP text here..."
              className="w-full p-4 sm:p-6 text-lg sm:text-xl border-4 border-dashed border-pink-400 rounded-3xl font-comic bg-white shadow-xl focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-300 transform transition-all hover:scale-102"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
            />

          </div>
          
          <div className="relative group">
            <input
              type="text"
              placeholder="🌟 Type your BOTTOM text here..."
              className="w-full p-4 sm:p-6 text-lg sm:text-xl border-4 border-dashed border-blue-400 rounded-3xl font-comic bg-white shadow-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-300 transform transition-all hover:scale-102"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
            />

          </div>
        </div>

        <div className="space-y-4 relative">
          <button
            onClick={handleAIGenerate}
            className="w-full p-6 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-3xl font-comic text-xl shadow-xl hover:shadow-2xl hover:from-purple-500 hover:to-pink-600 transform hover:scale-105 transition-all disabled:opacity-50 disabled:transform-none relative overflow-hidden group"
            disabled={isLoading}
          >
            <span className="relative z-10">
              {isLoading ? '🤖 Making it Super Funny...' : '🎨 Make it MEGA Funny! ✨'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </button>
          
          <button
            onClick={handleExport}
            className="w-full p-6 bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-3xl font-comic text-xl shadow-xl hover:shadow-2xl hover:from-green-500 hover:to-teal-600 transform hover:scale-105 transition-all disabled:opacity-50 disabled:transform-none relative overflow-hidden group"
            disabled={!backgroundImage}
          >
            <span className="relative z-10">
              📸 Save Your Amazing Meme! 🎉
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </button>
          

        </div>
      </div>
    </div>
  );
}

