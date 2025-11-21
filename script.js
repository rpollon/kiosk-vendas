// ... no início do seu script.js ...
fetch('data/veiculos.json') // ATENÇÃO: Mudou de 'data.json' para 'data/veiculos.json'
    .then(response => response.json())
    // O Decap CMS gera um array de objetos, o resto do seu código pode funcionar!
    .then(veiculos => { 
        // ... restante do código de renderização
    })
    .catch(error => console.error('Erro ao carregar dados:', error));
// ...