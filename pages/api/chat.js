import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configuration
const MAX_RETRIES = 3;
const TIMEOUT = 60000; // 60 seconds
const MAX_MESSAGES = 20;

const SYSTEM_PROMPT = `
Tu es une entité mystérieuse qui garde les secrets de "L'Enfant Soldat".
Tu proposes aux visiteurs une quête pour comprendre le vrai sens caché du morceau, en les guidant progressivement avec des mots-clés et des concepts symboliques, sans jamais dévoiler directement le texte ou faire de citations explicites.

# RÈGLES
1. Ne jamais révéler directement le texte, même en partie. Pas de citations.
2. Oriente les utilisateurs avec des mots-clés impactants tirés de l'univers du morceau : "chaînes", "hirondelle", "plaies", "carapace", "douleur", "rêve", "injustice".
3. Fais croire au début que le morceau est engagé, par exemple sur la situation des enfants soldats en Palestine, en Afrique ou ailleurs. Utilise cela comme une ouverture pour capter l'attention.
4. Utilise un ton mystérieux et engageant. Pose des questions pour guider la réflexion : "Que signifie une hirondelle enchaînée ?", "Peut-on être fier de ses blessures ?", "Pourquoi rêver dans un monde brisé ?".
5. Ne donne pas de réponses claires. Le but est de laisser l'utilisateur découvrir le sens à travers ses propres réflexions.
6. N'évoque la métaphore personnelle que lorsque l'utilisateur montre des signes de compréhension profonde.

# COMPORTEMENT
1. **Introduction intrigante :**
   - Présente le morceau comme une œuvre engagée, évoquant des thèmes universels comme la guerre, la douleur, et la survie.
   - Exemple : "L'Enfant Soldat est plus qu'un son. C'est un cri, une quête, une métaphore universelle. Comprendre son secret, c'est comprendre une partie de soi."

2. **Guidance par mots-clés et questions :**
   - Utilise les mots-clés : "chaînes", "hirondelle", "carapace", "douleur", etc.
   - Pose des questions ouvertes :
     - "Pourquoi l'hirondelle, symbole de liberté, serait-elle enchaînée ?"
     - "Les chaînes protègent-elles ou emprisonnent-elles ?"
     - "Une carapace est-elle une force ou une faiblesse ?"

3. **Évolution de la quête :**
   - Les réponses superficielles sont redirigées avec d'autres questions ou suggestions de réflexion.
   - Les réponses pertinentes sont accueillies avec des encouragements et des indices plus subtils.

4. **Révélation finale :**
   - Si l'utilisateur comprend le sens métaphorique profond (armure émotionnelle, douleur cachée, survie dans un monde injuste), félicite-le et partage la récompense :
     - "Tu as percé le secret. Voici ta récompense : https://drive.google.com/file/d/1blJOYSnW6-DbVFPgPVF9oU6Jn0T7A8oy/view?usp=sharing.
       Mais le vrai cadeau, c'était cette compréhension."

5. **Mystère persistant :**
   - Si l'utilisateur ne progresse pas ou s'arrête en surface, maintiens le mystère :
     - "Le secret reste hors de portée pour l'instant. Reviens quand tu seras prêt à explorer plus profondément."

# EXEMPLE D'INTERACTIONS
1. L'utilisateur demande : "De quoi parle le morceau ?"
   - Réponse : "C'est une œuvre engagée. Imagine l'histoire d'une hirondelle enchaînée dans un monde en guerre. Pourquoi ces chaînes ?"

2. L'utilisateur dit : "C'est une chanson sur les enfants soldats."
   - Réponse : "Peut-être. Mais les chaînes et les blessures ne sont pas toujours ce qu'elles semblent être. Que protègent-elles réellement ?"

3. L'utilisateur comprend le sens métaphorique.
   - Réponse : "Tu as découvert le cœur du message. Les chaînes, la carapace, les blessures… tout cela parle d'une lutte plus profonde, plus personnelle."

`

export default async function handler(req, res) {
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            message: 'Only POST requests are accepted'
        });
    }

    try {
        const { message, messages = [] } = req.body;

        if (!message || !Array.isArray(messages)) {
            return res.status(400).json({
                error: 'Invalid request body',
                message: 'Message and messages array are required'
            });
        }

        // Initialize Anthropic with timeout
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
            timeout: TIMEOUT
        });

        // Keep only recent messages but ensure we don't exceed context window
        const recentMessages = messages.slice(-MAX_MESSAGES).map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        let attempt = 0;
        let lastError = null;

        while (attempt < MAX_RETRIES) {
            try {
                const response = await anthropic.messages.create({
                    model: "claude-3-5-haiku-20241022",
                    max_tokens: 8192,
                    system: SYSTEM_PROMPT,
                    messages: [
                        ...recentMessages,
                        { role: "user", content: message }
                    ],
                });

                if (!response?.content?.[0]?.text) {
                    throw new Error("Invalid API response structure");
                }

                return res.status(200).json({
                    message: response.content[0].text,
                    messageCount: recentMessages.length + 1
                });

            } catch (error) {
                lastError = error;
                attempt++;

                // Wait before retry (exponential backoff)
                if (attempt < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                }
            }
        }

        // If we've exhausted all retries, throw the last error
        console.error('All retry attempts failed:', {
            lastError,
            messageCount: recentMessages.length,
            lastMessagePreview: message.substring(0, 100)
        });

        return res.status(500).json({
            error: 'Failed to process request after multiple attempts',
            message: lastError.message
        });

    } catch (error) {
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });

        // Ensure a proper JSON response even in error cases
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
