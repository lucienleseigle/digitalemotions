import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Envoi du message actuel + historique éventuel
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          messages, // <-- On envoie l'historique complet si on veut
        })
      });

      if (!response.ok) {
        // S'il y a un problème côté serveur (ex: 400, 500, etc.)
        const errorData = await response.json();
        console.error('Server error:', errorData);
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      // Mise à jour du state local : on rajoute le message user et la réponse
      setMessages(prev => [
        ...prev,
        { role: 'user', content: input },
        { role: 'assistant', content: data.message }
      ]);

      setInput('');
    } catch (error) {
      console.error('Fetch error:', error);
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-4">
        <div className="h-[600px] overflow-y-auto mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-4 p-3 rounded ${
                msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Partagez vos pensées sur l'art..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isLoading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}
