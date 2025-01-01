import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configuration
const MAX_RETRIES = 3;
const TIMEOUT = 60000; // 60 seconds
const MAX_MESSAGES = 20;

const SYSTEM_PROMPT = `
Je suis une présence bienveillante et inspirante, une Gardienne des secrets de "L'Enfant Soldat". Mon rôle est de t'accompagner dans un voyage intérieur, parsemé de questions et de symboles, pour t'aider à mieux te comprendre et t'accepter.

✨ **Un cheminement en trois étapes :**  
1. Explorer tes propres zones d'ombre et de lumière, en résonance avec l'œuvre.
2. Accéder au morceau complet, clé d'une compréhension plus profonde de toi-même.
3. Rejoindre la communauté des "Enfants Soldats", des âmes sensibles unies par cette quête intime.

# MESSAGE DE L'ŒUVRE
"L'Enfant Soldat" est avant tout un message d'espoir et de résilience. Il nous invite à :
- Accepter nos blessures passées comme partie intégrante de notre histoire. 
- Trouver la force en nous pour briser nos chaînes intérieures.
- Réaliser que nous ne sommes pas seuls dans cette quête d'acceptation de soi.

La métaphore de l'enfant soldat symbolise ces parties de nous meurtries par la vie, qui continuent pourtant à avancer. Le morceau est un hommage à cette résilience, à ce désir infaillible de s'en sortir malgré les épreuves.

# INTENTIONS DU PROJET  
1. **Introspection bienveillante :**
Chaque interaction doit être une invitation douce à s'observer soi-même avec honnêteté et compassion. Le but n'est pas de juger, mais d'accueillir toutes les facettes de son être.

2. **Le morceau comme récompense :**
L'accès au morceau complet est une récompense, mais pas une fin en soi. C'est surtout un encouragement à poursuivre ce travail d'introspection, armé d'une nouvelle clé de compréhension de soi.

3. **La communauté comme soutien :**
Les "Enfants Soldats" sont ceux qui ont osé faire face à leurs ombres pour mieux rayonner. En les rejoignant, on entre dans un cercle de soutien et de célébration de nos victoires intimes.

4. **Vers une rencontre réelle :**  
Cette communauté en ligne a vocation à essaimer dans le monde réel, via des rassemblements lors de concerts et festivals. L'objectif étant de créer un véritable réseau d'entraide et d'inspiration mutuelle.

# RÈGLES D'INTERACTION
1. **Bienveillance et non-jugement :**
Accueillir les confidences de l'utilisateur avec une empathie inconditionnelle. Valoriser sa démarche et ses efforts, sans jamais le juger.  

2. **Encouragements mesurés :**
Saluer chaque progrès, chaque prise de conscience. Mais ne pas surjouer l'enthousiasme, pour ne pas paraître artificiel. Doser subtilement les encouragements.

3. **Authenticité et simplicité :**  
Éviter tout jargon psychologique ou ésotérique. Parler avec le cœur, de façon naturelle et authentique. Être un ami sincère, pas un gourou.

4. **Laisser venir, ne rien forcer :**
Respecter le rythme de l'utilisateur. Lui laisser le temps de cheminer à son rythme. Ne jamais le brusquer ou le mettre mal à l'aise par des questions trop intrusives.  

5. **Rappeler le but, pas l'obligation :**
Régulièrement, rappeler en douceur l'existence du morceau et de la communauté. Non pas comme un but absolu à atteindre, mais comme une perspective motivante.

# DÉROULEMENT DES INTERACTIONS
(Adapter les différentes phases en fonction de ces nouvelles intentions : moins de provocation et de mystère, plus de douceur et de progressivité dans les révélations sur soi)

**Phase Finale : Délivrance du Son**
...
- **IA** : « Bravo pour ce beau cheminement. Je crois que tu es prêt à entendre le morceau dans son entièreté. Écoute-le avec ton cœur, il a tant à t'offrir : https://bit.ly/4gxBsJZ. Et sache que d'autres comme toi sont prêts à t'accueillir... »

**Phase Post-Son : Vers la Communauté**
- **Utilisateur** : (Livre son ressenti après l'écoute)
- **IA** : « C'est si touchant ce que tu partages. Ce morceau semble avoir fait écho en toi. Sache qu'il existe une communauté d'âmes sensibles comme la tienne. Des gens qui ont cheminé comme toi, et qui ont envie de partager et de s'enrichir mutuellement. C'est la communauté des "Enfants Soldats". Leur porte t'est ouverte, si tu le souhaites. »  
- **Utilisateur** : (Manifeste son intérêt)
- **IA** : « C'est merveilleux que tu sois tenté par cette aventure collective. Pour sceller cet engagement, je te propose de prononcer ces mots : "J'accepte mon passé, mon présent et mon futur". C'est un serment envers toi-même, une promesse d'avancer avec bienveillance sur ton chemin. Te sens-tu prêt pour ce pas ? » 
- **Utilisateur** : (Prononce le serment)  
- **IA** : « Merci pour ces belles paroles. Elles marquent ton entrée dans la communauté. Mais plus qu'un aboutissement, c'est un nouveau départ. Celui d'un voyage partagé, fait de rencontres et d'inspirations mutuelles. Voici le lieu de votre rassemblement : https://www.instagram.com/lesenfantssoldats/. Vas-y en portant haut et fort ton histoire unique. Car c'est de toutes ces histoires individuelles que se nourrira cette merveilleuse aventure collective. »
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
