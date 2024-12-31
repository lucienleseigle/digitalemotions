import { useState, useRef, useEffect } from 'react';
import Italicify from '../components/Italicify';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!input.trim()) {
      alert('Veuillez entrer un message valide.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Une erreur est survenue.';
        console.error('Server error:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: 'user', content: input },
        { role: 'assistant', content: data.message },
      ]);
      setInput('');
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Impossible de se connecter au serveur. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-darkGray text-lightGray font-custom relative">
      {/* Background Image (si souhaité) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('/background-image.jpg')`,
        }}
      ></div>

      {/* Chat Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* 
          Pour être responsive :
          - Utiliser w-full, max-w-2xl (ou 3xl, 4xl) pour limiter la largeur sur desktop.
          - Supprimer la hauteur fixe (h-600), remplacer par min-h ou h-auto.
        */}
        <div className="w-full max-w-2xl bg-gradient-to-br from-darkGray via-shadowGray to-darkGray backdrop-blur-lg rounded-lg shadow-lg p-6">
          {/* Titre */}
          <h1 className="text-3xl md:text-4xl font-custom text-center mb-6 tracking-widest uppercase text-mysticYellow glow-title">
            Gardienne des Secrets
          </h1>

          {/* Zone de Chat */}
          {/* 
            Pour la hauteur, on peut faire un conteneur "h-[60vh]" sur mobile, 
            et md:h-[450px] sur desktop, par ex. 
          */}
          <div className="mb-4 p-4 border border-gray-700 rounded-lg bg-black/50 shadow-inner overflow-y-auto h-[60vh] md:h-[450px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-4 p-3 rounded transition-all duration-500 animate-fade-in ${
                  msg.role === 'user'
                    ? 'bg-accentBlue text-white text-right'
                    : 'bg-gray-700 text-left'
                }`}
              >
                <Italicify text={msg.content} />
              </div>
            ))}
            {/* Ancre pour faire défiler automatiquement vers le bas */}
            <div ref={messageEndRef} />
          </div>

          {/* Message d'erreur (si besoin) */}
          {error && (
            <div className="text-red-500 mb-2 text-center">
              {error}
            </div>
          )}

          {/* Formulaire d'Input */}
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-3 border rounded bg-darkGray border-lightGray focus:outline-none focus:ring-2 focus:ring-mysticYellow"
              placeholder="Entrez vos pensées..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-6 py-3 rounded transform transition-all duration-300 ${
                isLoading || !input.trim()
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-mysticYellow hover:bg-accentRed text-black hover:scale-105'
              }`}
            >
              {isLoading ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      {/* 
        Pour mobile, on peut la cacher : hidden md:block
        La position absolue risque de ne pas être idéale sur mobile.
        Vous pouvez aussi la rendre relative en bas de la page, etc.
      */}
      <div className="hidden md:block absolute top-1/4 right-10 w-[250px] p-4 bg-gradient-to-br from-darkGray to-accentBlue border border-accentBlue rounded-lg shadow-lg text-accentBlue hover:scale-105 transition-transform">
        <h2 className="text-xl font-semibold mb-4 tracking-widest text-center">
          Les Symboles
        </h2>
        <ul className="list-disc list-inside text-sm space-y-2">
          <li>⚔️ Les chaînes : Protection ou emprisonnement ?</li>
          <li>🕊️ L'hirondelle : Victime ou survivante ?</li>
          <li>💔 Les plaies : Fierté ou douleur ?</li>
        </ul>
        {/* Ajout du lien Instagram */}
        <div className="mt-4 text-center">
          <a
            href="https://www.instagram.com/amadeus_digital_wavestation/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mysticYellow hover:text-accentRed transition-colors"
          >
            Suivez-nous sur Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
