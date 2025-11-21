document.addEventListener('DOMContentLoaded', () => {
    // ⚠️ SUA URL CSV PUBLICADA (Planilha Google)
    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR4UYJgaHtWLW0cjjvyaexPmL7atrFWNCaj6BHwn6k8ZQP90a2ViAWonJSgP0nKCIM5L4BrCZ7KWiLU/pub?gid=1842449585&single=true&output=csv'; 

    const carrosselContainer = document.getElementById('carrossel-container');
    const modal = document.getElementById('lead-modal');
    const fecharModalBtn = document.querySelector('.close-button');
    const form = document.getElementById('lead-form');
    const iniciarKioskBtn = document.getElementById('iniciarKiosk');
    const headerPrompt = document.querySelector('.fullscreen-prompt');
    
    let currentCarIndex = 0;
    let autoplayInterval;
    const AUTOPLAY_TIME_MS = 5000;
    let isPaused = false;
    let veiculosData = [];

    // --- FUNÇÕES DE CONTROLE ---

    function startAutoplay() {
        if (!isPaused) {
            autoplayInterval = setInterval(nextCar, AUTOPLAY_TIME_MS);
        }
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    function pauseTemporarily() {
        isPaused = true;
        stopAutoplay();
        // Reinicia o autoplay após 15 segundos de inatividade
        setTimeout(() => {
            isPaused = false;
            startAutoplay();
        }, 15000); 
    }

    function nextCar() {
        if (veiculosData.length > 0) {
            currentCarIndex = (currentCarIndex + 1) % veiculosData.length;
            updateCarrossel();
        }
    }

    function updateCarrossel() {
        carrosselContainer.style.transform = `translateX(${-currentCarIndex * 100}%)`;
        // Atualiza o interesse do formulário com o modelo atual
        if (veiculosData[currentCarIndex]) {
            document.getElementById('carro-interesse').value = veiculosData[currentCarIndex].modelo;
        }
    }

    // --- LÓGICA DO MODAL ---

    function openModal(modelo) {
        stopAutoplay();
        modal.style.display = 'flex';
        document.getElementById('carro-interesse').value = modelo;
    }

    function closeModal() {
        modal.style.display = 'none';
        // Limpa o formulário e a mensagem de sucesso
        form.reset();
        document.querySelector('.sucesso-msg').style.display = 'none';
        document.querySelector('#enviar-lead').style.display = 'block';

        // Volta a rodar o carrossel
        startAutoplay();
    }

    fecharModalBtn.addEventListener('click', closeModal);

    // Fechar ao clicar fora do modal
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Submissão do Formulário (Simulação de Envio)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simula o envio de dados (Aqui você enviaria para um servidor real, Google Forms ou E-mail)
        console.log("LEAD CAPTURADO:", {
            Nome: document.getElementById('lead-nome').value,
            Telefone: document.getElementById('lead-telefone').value,
            Interesse: document.getElementById('carro-interesse').value
        });

        // Mostra mensagem de sucesso e esconde o botão
        document.querySelector('#enviar-lead').style.display = 'none';
        document.querySelector('.sucesso-msg').style.display = 'block';

        // Fecha o modal após 3 segundos
        setTimeout(closeModal, 3000);
    });

    // --- PARSE CSV DA PLANILHA GOOGLE ---
    
    function parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        // Lê os cabeçalhos da primeira linha
        const headers = lines[0].split(',').map(header => header.trim());
        const result = [];

        // Começa a processar da segunda linha (dados)
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const vehicle = {};
            
            // Mapeia valores para os cabeçalhos
            for (let j = 0; j < headers.length; j++) {
                // Remove as aspas duplas desnecessárias do CSV
                vehicle[headers[j]] = values[j] ? values[j].trim().replace(/^"|"$/g, '') : '';
            }
            
            // Filtra e converte o campo 'ativo'
            // O CSV retorna "TRUE" ou "FALSE" como texto, mas queremos apenas os ativos
            if (vehicle.ativo && (vehicle.ativo.toUpperCase() === 'TRUE' || vehicle.ativo.toUpperCase() === 'SIM')) {
                result.push(vehicle);
            }
        }
        return result;
    }

    // --- CARREGAMENTO DE DADOS E RENDERIZAÇÃO ---
    
    fetch(CSV_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao carregar a Planilha Google: ' + response.statusText);
            }
            return response.text();
        })
        .then(csvText => {
            veiculosData = parseCSV(csvText);
            if (veiculosData.length > 0) {
                renderCarrossel(veiculosData);
                startAutoplay();
            } else {
                carrosselContainer.innerHTML = '<p class="erro-mensagem">Nenhum veículo ativo encontrado na planilha.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao carregar dados:', error);
            carrosselContainer.innerHTML = '<p class="erro-mensagem">Erro ao carregar os anúncios. Verifique a URL da planilha.</p>';
        });

    function renderCarrossel(veiculos) {
        carrosselContainer.innerHTML = '';
        veiculos.forEach((veiculo, index) => {
            const carroSlide = document.createElement('div');
            carroSlide.className = 'carrossel-slide';
            carroSlide.setAttribute('data-index', index);
            
            // ATENÇÃO: veiculo.foto_url deve ser uma URL pública da sua imagem
            carroSlide.innerHTML = `
                <img src="${veiculo.foto_url}" alt="${veiculo.modelo}" class="carro-foto">
                <div class="info-overlay">
                    <h2 class="carro-modelo">${veiculo.modelo}</h2>
                    <p class="carro-valor">${veiculo.valor}</p>
                    <button class="botao-interesse" data-modelo="${veiculo.modelo}">Tenho Interesse</button>
                </div>
            `;
            
            // Adiciona listener ao botão de interesse
            const btnInteresse = carroSlide.querySelector('.botao-interesse');
            btnInteresse.addEventListener('click', (e) => {
                openModal(e.target.dataset.modelo);
                pauseTemporarily(); // Pausa o autoplay após interação
            });

            // Adiciona listener para interações de toque (para tablets)
            carroSlide.addEventListener('touchstart', pauseTemporarily);
            carroSlide.addEventListener('mousedown', pauseTemporarily);

            carrosselContainer.appendChild(carroSlide);
        });

        // Aplica o estilo de largura para o container principal
        carrosselContainer.style.width = `${veiculos.length * 100}%`;
    }

    // --- FULLSCREEN E INÍCIO DO KIOSK ---

    iniciarKioskBtn.addEventListener('click', () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
            document.documentElement.msRequestFullscreen();
        }
        
        headerPrompt.style.display = 'none';
        carrosselContainer.style.opacity = '1';
    });
});
