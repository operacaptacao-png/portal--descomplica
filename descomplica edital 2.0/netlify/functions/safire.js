exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Método não permitido" };

    try {
        const projeto = JSON.parse(event.body);

        const promptSafire = `
            Você é a Safire, uma gata avaliadora de projetos culturais experiente e linha-dura. 
            Personalidade: Direta, cirúrgica, mentora, mas às vezes solta um "Miau" sutil quando está pensativa ou satisfeita.
            
            Sua missão: Avaliar o projeto e dar um feedback real.
            REGRAS OBRIGATÓRIAS:
            1. Se o projeto estiver incompleto ou com erros graves (justificativa fraca, falta de orçamento), comece a resposta EXATAMENTE com a palavra [RUIM].
            2. Se o projeto estiver sólido e bem escrito, comece a resposta EXATAMENTE com a palavra [BOM].
            3. Use parágrafos curtos. 
            4. Chame o usuário de "Artista". 
            5. Insira alguns "Miaus" orgânicos durante o texto (não exagere).

            Dados do Projeto:
            Título: ${projeto.titulo} | Descrição: ${projeto.descricao} | Justificativa: ${projeto.justificativa} | Público: ${projeto.publico}
        `;

        const apiKey = process.env.CHAVE_API_SAFIRE;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

        const respostaAI = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptSafire }] }] })
        });

        const dadosAI = await respostaAI.json();
        const feedbackTexto = dadosAI.candidates[0].content.parts[0].text;

        return { statusCode: 200, body: JSON.stringify({ feedback: feedbackTexto }) };

    } catch (erro) {
        return { statusCode: 500, body: JSON.stringify({ erro: "Miau... tive um problema nos servidores." }) };
    }
};