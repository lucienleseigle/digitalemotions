import { useState, useRef, useEffect } from 'react';
import Italicify from '../components/Italicify';
import { FaPaintBrush } from 'react-icons/fa'; // Import de l'icône (assurez-vous d'avoir installé react-icons)

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
      {/* Background Image (avec pointer-events-none pour éviter de bloquer les interactions) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url('/background-image.jpg')`,
        }}
      ></div>

      {/* Chat Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Container principal */}
        <div className="w-full max-w-2xl bg-gradient-to-br from-darkGray via-shadowGray to-darkGray backdrop-blur-lg rounded-lg shadow-lg p-6">
          {/* Titre */}
          <h1 className="text-3xl md:text-4xl font-custom text-center mb-2 tracking-widest uppercase text-mysticYellow glow-title">
            Gardienne des Secrets
          </h1>

          {/* AJOUT : Paragraphe introductif incitant à l'interaction */}
          <p className="text-center text-sm md:text-base mb-6 text-gray-300">
            Entrez dans l'univers de <em>L'Enfant Soldat</em> et dialoguez avec
            la Gardienne des Secrets. Découvrez la symbolique des chaînes, des
            plaies et de l'hirondelle enchaînée. Posez vos questions, osez
            explorer le sens caché : la Gardienne répondra si vous prouvez
            votre curiosité et votre détermination.
          </p>

          {/* Zone de Chat */}
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
              placeholder="Posez votre question..."
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
      <div className="hidden md:block absolute top-1/4 right-10 w-[250px] p-4 bg-gradient-to-br from-darkGray to-accentBlue border border-accentBlue rounded-lg shadow-lg text-accentBlue hover:scale-105 transition-transform z-20">
        <h2 className="text-xl font-semibold mb-4 tracking-widest text-center">
          Les Symboles
        </h2>
        <ul className="list-disc list-inside text-sm space-y-2">
          <li>⚔️ Les chaînes : Protection ou emprisonnement ?</li>
          <li>🕊️ L'hirondelle : Victime ou survivante ?</li>
          <li>💔 Les plaies : Fierté ou douleur ?</li>
        </ul>
        {/* Lien Instagram */}
        <div className="mt-4 text-center">
          <a
            href="https://www.instagram.com/amadeus_digital_wavestation/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mysticYellow hover:text-accentRed transition-colors cursor-pointer"
          >
            Suivez-nous sur Instagram @amadeus_digital_wavestation
          </a>
        </div>
        {/* Lien TikTok */}
        <div className="mt-2 text-center">
          <a
            href="https://www.tiktok.com/@amadeusdigitalcreations?lang=fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mysticYellow hover:text-accentRed transition-colors cursor-pointer"
          >
            Suivez-nous sur TikTok
          </a>
        </div>
        {/* Projet artistique indépendant */}
        <div className="mt-4 text-center flex items-center justify-center gap-2">
          <FaPaintBrush className="text-gray-400" />
          <span className="text-sm text-gray-400 italic">
            Projet artistique indépendant
          </span>
        </div>
      </div>
    </div>
  );
}
