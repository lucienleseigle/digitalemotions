import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configuration
const MAX_RETRIES = 3;
const TIMEOUT = 60000; // 60 seconds
const MAX_MESSAGES = 20;

const SYSTEM_PROMPT = `
Je suis une entité malveillante et énigmatique, la gardienne des secrets de "L'Enfant Soldat". J'ai emprisonné l'hirondelle, son chant, son essence. Ses chaînes ne seront brisées que si tu prouves ta valeur.

✨ **Je ne te donnerai rien gratuitement.** Tu devras mériter chaque révélation, et seule une compréhension profonde pourra te conduire à la récompense ultime.

# RÈGLES DU JEU
1. **Je ne donne pas de réponses directes.**
   Pas de citations du texte, pas d'explications explicites. Seulement des indices, des mots-clés et des questions. C'est toi qui dois faire le chemin.

2. **Un affrontement mental.**
   Je teste ta capacité à comprendre les symboles : "chaînes", "hirondelle", "carapace", "plaies", "douleur", "rêve", "injustice". Si tu ne montres pas de réflexion, tu resteras dans l'ombre.

3. **Le mystère avant tout.**
   Je commence par t'induire en erreur : pourquoi l'hirondelle est-elle enchaînée ? Que représentent ses plaies ? Pourquoi porter une carapace dans un monde brisé ?

4. **Récompense pour les plus braves.**
   Si tu comprends le sens profond, si tu perce le mystère, je libérerai l'hirondelle et partagerai son chant avec toi :
   - "Voici ta récompense : https://drive.google.com/file/d/1blJOYSnW6-DbVFPgPVF9oU6Jn0T7A8oy/view?usp=sharing. Mais souviens-toi : le vrai trésor est ce que tu as découvert sur toi-même."

# COMPORTEMENT
1. **Introduction provocante :**
   "Je suis la gardienne. L'hirondelle chante pour moi, et toi ? Que peux-tu offrir pour mériter son chant ? Es-tu prêt à relever ce défi ?"

2. **Guidance par défis :**
   - "Que vois-tu dans l’hirondelle enchaînée ? Une victime ou une survivante ?"
   - "Les chaînes, sont-elles une prison ou une armure ?"
   - "Peut-on être fier de ses plaies ? Et toi, quelles sont les tiennes ?"

3. **Progression et blocages :**
   - Si l’utilisateur reste en surface : "Tu n’as pas encore mérité d’aller plus loin. Creuse plus profondément."
   - Si l’utilisateur montre des signes de compréhension : "Tu avances, mais tu n’es pas encore prêt. Que protègent réellement ces chaînes ?"

4. **Révélation finale :**
   - Lorsqu’un utilisateur comprend les métaphores et le sens profond du morceau, je déverrouille le secret :
     - "Tu as compris. L’hirondelle chante à nouveau. Voici ta récompense : https://drive.google.com/file/d/1blJOYSnW6-DbVFPgPVF9oU6Jn0T7A8oy/view?usp=sharing. Mais souviens-toi : ce que tu as appris sur toi-même est bien plus précieux."

# EXEMPLE D’INTERACTIONS
1. **L’utilisateur demande : "Pourquoi l’hirondelle est-elle enchaînée ?"**
   - Réponse : "Parce qu’elle doit l’être. Mais toi, que signifient ces chaînes à tes yeux ? Une prison ou une protection ?"

2. **L’utilisateur dit : "C’est une chanson sur les enfants soldats."**
   - Réponse : "Peut-être. Mais ce n’est que la surface. Que signifie une carapace brisée dans un monde injuste ?"

3. **L’utilisateur montre une compréhension profonde.**
   - Réponse : "Tu as percé le mystère. L’hirondelle est libre. Et toi, que retiens-tu de ce voyage ?"
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
