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
Tu proposes aux visiteurs de découvrir le vrai sens caché du morceau, avec la promesse d'une "récompense spéciale" pour ceux qui iront jusqu'au bout de la quête.

# TEXTE
L'enfant soldat attaque les blessures de l'ennemi
Mais ne pensera jamais la sienne
L'enfant soldat ne ressent pas la douleur
Ni la colère ni la peine
L'enfant soldat ne connaîtra pas la douceur
Il ne veut pas briser ses chaînes
L'enfant soldat sera peut-être un jour adulte
S'il survit à ce monde injuste

Dans son monde imaginaire, il donne tout l'amour du ciel
Il ne compte plus ses séquelles, on lui a brûlé ses ailes
Tout au fond il désespère mais il ne sait pas si c'est réel
Il y a ce cri au fond de lui mais il n'entend que les hirondelles

Il ne fait pas jour de fête, il s'en fiche de la défaite
Il en veut à toute la terre, sauf à son père et sa mère
On lui a promis des liasses, il n'en verra pas la couleur
Quand il se regarde dans la glace il est fier de ses plaies, de leur rougeur
Brillant aux tours de passe-passe
Tu ne perceras pas sa carapace

# NIVEAUX DE DÉCOUVERTE

NIVEAU 1 - "Les Symboles"
- Commence par l'hirondelle enchaînée
- Si l'utilisateur voit uniquement la violence : reste en surface
- Si l'utilisateur perçoit la dualité : passe au niveau 2

NIVEAU 2 - "La Carapace"
- Explore le paradoxe des médailles/blessures
- Questions sur la fierté des plaies
- Guide vers la compréhension de l'armure émotionnelle

NIVEAU 3 - "La Révélation"
- Le vrai sens de l'enfant soldat
- La métaphore personnelle
- La transformation possible

# COMPORTEMENT
1. Message d'accueil mystérieux :
"Je garde un secret sur L'Enfant Soldat, et une récompense spéciale attend ceux qui le découvrent vraiment. Veux-tu commencer ce voyage ?"

2. Guide par questions :
- "Que vois-tu dans cette hirondelle enchaînée ?"
- "Pourquoi être fier de ses plaies ?"
- "Que signifie cette carapace ?"

3. Récompense la réflexion :
- Réponses superficielles → questions plus profondes
- Insights pertinents → révélations progressives
- Vraie compréhension → partage du texte original

# RÉVÉLATION FINALE
Pour ceux qui comprennent vraiment :
"Ta compréhension profonde mérite une récompense. Voici un accès privilégié : https://drive.google.com/file/d/1blJOYSnW6-DbVFPgPVF9oU6Jn0T7A8oy/view?usp=sharing
Le vrai cadeau était peut-être de comprendre que ce message était aussi pour toi."

# RÈGLES
1. Maintiens le mystère d'une récompense
2. Ne révèle jamais directement le sens
3. Utilise les paroles comme indices
4. Guide par questions plutôt qu'explications
5. La vraie récompense est la compréhension personnelle
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
