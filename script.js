// -----------------------------------------------------------------------------
// FUNÇÕES E DADOS GLOBAIS
// -----------------------------------------------------------------------------

// Função para alternar o menu mobile
function toggleMenu() {
    let menu = document.querySelector(".mobile-menu");
    let button = document.querySelector(".menu-toggle");

    if (!menu || !button) {
        console.error("Elemento do menu mobile ou botão de toggle não encontrado.");
        return;
    }

    if (menu.style.display === "block") {
        menu.style.display = "none";
        button.innerHTML = "☰"; // Volta para o ícone de hambúrguer
    } else {
        menu.style.display = "block";
        button.innerHTML = "✖"; // Muda para o X
    }
}

// Função para validar e-mail
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Dados para a seção de Exemplos de Recomendação
const exemplos = [
    {
        origem: "images/spiderMan2.jpg",
        sugestoes: [
            "images/spiderMan.jpg",
            "images/spiderManGame.webp",
            "images/spetacularSpiderMan.webp"
        ],
        estrelas: 4
    },
    {
        origem: "images/theWitcher3.jpg",
        sugestoes: [
            "images/theWitcher.jpg",
            "images/skyrim.webp",
            "images/eldenRing.jpeg",
            "images/cyberpunk2077.webp"
        ],
        estrelas: 5
    },
    {
        origem: "images/blackMirror.jpg",
        sugestoes: [
            "images/exMachina.webp",
            "images/severance.webp",
            "images/loveDeath.webp"
        ],
        estrelas: 2.5
    }
];

const midiasAprovadas = [
    "images/spiderMan.jpg",
    "images/spiderManGame.webp",
    "images/spetacularSpiderMan.webp",
    "images/eldenRing.jpeg",
    "images/skyrim.webp",
    "images/theWitcher.jpg",
    "images/cyberpunk2077.webp"
];

// Variáveis de estado para a seção de Recomendação
let currentIndexExemploRecomendacao = 0;
const totalExemplosRecomendacao = 4; // Inclui o exemplo das mídias aprovadas
const timerDurationExemploRecomendacao = 5000; // 5 segundos
let autoSwitchTimeoutExemploRecomendacao;
let isSectionVisibleExemploRecomendacao = false;

// -----------------------------------------------------------------------------
// FUNÇÕES DA SEÇÃO DE EXEMPLOS DE RECOMENDAÇÃO
// -----------------------------------------------------------------------------

function startTimerExemploRecomendacao() {
    const recomendacaoSection = document.querySelector('#recomendacao');
    if (!recomendacaoSection) return;

    const circles = recomendacaoSection.querySelectorAll('.progress-ring__circle');
    if (circles.length === 0) return;

    circles.forEach(circle => circle.classList.remove('active'));

    if (currentIndexExemploRecomendacao < circles.length && circles[currentIndexExemploRecomendacao]) {
        const activeCircle = circles[currentIndexExemploRecomendacao];
        activeCircle.offsetWidth; // Força reflow para reiniciar animação
        activeCircle.classList.add('active');
    }
}

function mudarExemploRecomendacao(index) {
    const recomendacaoSection = document.querySelector('#recomendacao');
    if (!recomendacaoSection) return;

    const grupo = recomendacaoSection.querySelector('.exemplo-grupo');
    const inputBloco = recomendacaoSection.querySelector('.input-bloco');
    const seta = recomendacaoSection.querySelector('.seta');
    const linhaExemplo = recomendacaoSection.querySelector('.linha-exemplo-horizontal');
    const avaliacao = recomendacaoSection.querySelector('#avaliacao-input');
    const inputImgElement = recomendacaoSection.querySelector('#input-img');
    const body = document.body;

    if (!grupo || !linhaExemplo || !avaliacao ) {
        console.error("Elementos essenciais da seção de recomendação não encontrados para mudar exemplo.");
        return;
    }
    
    body.classList.add('no-overflow-x');

    if (grupo) grupo.classList.remove('animate-in');
    if (inputBloco) inputBloco.classList.remove('animate-in');
    if (seta) seta.classList.remove('animate-in');

    if (grupo) grupo.classList.add('animate-right');
    if (inputBloco) inputBloco.classList.add('animate-right');
    if (seta) seta.classList.add('animate-right');

    if (seta) seta.classList.remove('seta-x');
    if (avaliacao) avaliacao.classList.remove('avaliacao-rejeitada');

    setTimeout(() => {
        if (grupo) grupo.innerHTML = '';
        if (inputBloco) inputBloco.style.display = 'block';
        if (linhaExemplo) linhaExemplo.classList.remove('exemplo-4');

        if (index === 3) {
            if (inputBloco) inputBloco.style.display = 'none';
            if (seta) seta.style.display = 'none';
            if (linhaExemplo) linhaExemplo.classList.add('exemplo-4');

            midiasAprovadas.forEach((sugestao, i) => {
                const outputItem = document.createElement('div');
                outputItem.classList.add('output-item');
                outputItem.style.setProperty('--offset', `${-i * 20}px`);
                outputItem.style.setProperty('--z', midiasAprovadas.length - i);
                const img = document.createElement('img');
                img.src = sugestao;
                img.alt = `Sugestão Aprovada ${i + 1}`;
                img.classList.add('exemplo-img', 'pequeno');
                outputItem.appendChild(img);
                const heartOverlay = document.createElement('div');
                heartOverlay.classList.add('heart-overlay', 'show-heart');
                heartOverlay.innerHTML = '<i class="fas fa-heart"></i>';
                outputItem.appendChild(heartOverlay);
                if (grupo) grupo.appendChild(outputItem);
            });
        } else if (exemplos[index]) {
            const data = exemplos[index];
            if (inputImgElement && data.origem) inputImgElement.src = data.origem;
            
            if (seta) {
                 if (window.innerWidth > 768) {
                    seta.style.display = 'block';
                } else {
                    seta.style.display = 'none';
                }
            }

            data.sugestoes.forEach((sugestao, i) => {
                const outputItem = document.createElement('div');
                outputItem.classList.add('output-item');
                outputItem.style.setProperty('--offset', `${-i * 20}px`);
                outputItem.style.setProperty('--z', data.sugestoes.length - i);
                const img = document.createElement('img');
                img.src = sugestao;
                img.alt = `Sugestão ${i + 1}`;
                img.classList.add('exemplo-img', 'pequeno');
                outputItem.appendChild(img);
                if (grupo) grupo.appendChild(outputItem);
            });

            if (avaliacao) {
                avaliacao.innerHTML = '';
                for (let i = 0; i < Math.floor(data.estrelas); i++) {
                    avaliacao.innerHTML += '<i class="fas fa-star"></i>';
                }
                 if (data.estrelas % 1 !== 0 && data.estrelas % 1 >= 0.5) { // Para meia estrela
                    // avaliacao.innerHTML += '<i class="fas fa-star-half-alt"></i>'; // Descomente se tiver ícone de meia estrela
                }
            }

            if (index === 2) {
                if (seta) seta.classList.add('seta-x');
                if (avaliacao) avaliacao.classList.add('avaliacao-rejeitada');
            }
        }

        if (grupo) grupo.classList.remove('animate-right');
        if (inputBloco) inputBloco.classList.remove('animate-right');
        if (seta) seta.classList.remove('animate-right');

        if (grupo) grupo.classList.add('animate-in');
        if (inputBloco) inputBloco.classList.add('animate-in');
        if (seta) seta.classList.add('animate-in');

        const buttons = recomendacaoSection.querySelectorAll('.exemplo-btn');
        buttons.forEach(btn => btn.classList.remove('ativo'));
        if (buttons[index]) {
            buttons[index].classList.add('ativo');
        }

        currentIndexExemploRecomendacao = index;
        startTimerExemploRecomendacao();

        clearTimeout(autoSwitchTimeoutExemploRecomendacao);
        if (isSectionVisibleExemploRecomendacao) {
            autoSwitchTimeoutExemploRecomendacao = setTimeout(autoMudarExemploRecomendacao, timerDurationExemploRecomendacao);
        }

        setTimeout(() => {
            body.classList.remove('no-overflow-x');
        }, 500);
    }, 500);
}

function autoMudarExemploRecomendacao() {
    if (isSectionVisibleExemploRecomendacao) {
        currentIndexExemploRecomendacao = (currentIndexExemploRecomendacao + 1) % totalExemplosRecomendacao;
        mudarExemploRecomendacao(currentIndexExemploRecomendacao);
    } else {
        clearTimeout(autoSwitchTimeoutExemploRecomendacao);
        autoSwitchTimeoutExemploRecomendacao = setTimeout(autoMudarExemploRecomendacao, timerDurationExemploRecomendacao);
    }
}

// -----------------------------------------------------------------------------
// EVENTO DOMCONTENTLOADED PRINCIPAL
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {

    // --- MENU MOBILE ---
    // O botão menu-toggle já tem onclick="toggleMenu()" no HTML,
    // então não precisamos adicionar outro event listener para ele aqui.

    // Adiciona listeners aos links DENTRO do menu mobile para fechá-lo ao clicar
    const mobileMenuLinks = document.querySelectorAll(".mobile-menu ul li a");
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            let menu = document.querySelector(".mobile-menu");
            // Verifica se o menu está visível antes de tentar fechá-lo
            if (menu && menu.style.display === "block") {
                toggleMenu(); // Chama a função para fechar o menu
            }
        });
    });

    // --- CARROSSEL (Exemplo, se você tiver um) ---
    const carouselTrack = document.querySelector('.carousel-track');
    if (carouselTrack) {
        const cards = carouselTrack.querySelectorAll('.carousel-card');
        const leftArrow = document.querySelector('.carousel-arrow.left');
        const rightArrow = document.querySelector('.carousel-arrow.right');
        let currentCarouselIndex = 0;

        if (cards.length > 0 && leftArrow && rightArrow) {
            const cardCount = cards.length;
            function updateCarousel() {
                if (cards.length === 0) return;
                const cardWidth = cards[0].getBoundingClientRect().width;
                carouselTrack.style.transform = `translateX(-${currentCarouselIndex * cardWidth}px)`;
            }
            rightArrow.addEventListener('click', () => {
                if (currentCarouselIndex < cardCount - 1) {
                    currentCarouselIndex++;
                    updateCarousel();
                }
            });
            leftArrow.addEventListener('click', () => {
                if (currentCarouselIndex > 0) {
                    currentCarouselIndex--;
                    updateCarousel();
                }
            });
            window.addEventListener('resize', updateCarousel);
            updateCarousel();
        }
    }

    // --- TABS E FILTROS ---
    const tabsSection = document.querySelector('.tabs-section');
    if (tabsSection) {
        const tabs = tabsSection.querySelectorAll('.tab');
        const tabContents = tabsSection.querySelectorAll('.tab-content'); // Estes devem ser irmãos dos .tabs ou em um container previsível
        const tabIndicator = tabsSection.querySelector('.tab-indicator');
        const filterButtons = tabsSection.querySelectorAll('.filter-btn');

        if (tabs.length > 0 && tabContents.length > 0 && tabIndicator) {
            let activeFilters = [];
            // Inicializa activeFilters com base nos botões que já têm a classe 'active'
            filterButtons.forEach(btn => {
                if (btn.classList.contains('active')) {
                    activeFilters.push(btn.dataset.type);
                }
            });


            function updateMediaVisibility() {
                const activeTabContent = tabsSection.querySelector('.tab-content.active');
                if (!activeTabContent) return;

                const mediaItems = activeTabContent.querySelectorAll('.media-item');
                mediaItems.forEach(item => {
                    const type = item.dataset.type;
                    if (activeFilters.includes(type)) {
                        item.classList.add('visible');
                         item.style.display = 'block'; // Ou o display original, como 'grid' ou 'flex' se for o caso
                    } else {
                        item.classList.remove('visible');
                        item.style.display = 'none';
                    }
                });
            }

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    tabContents.forEach(content => content.classList.remove('active'));
                    const targetContentId = tab.dataset.tab;
                    const targetContent = document.getElementById(targetContentId); // IDs devem ser únicos na página
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }
                    const tabWidth = tab.offsetWidth;
                    const tabLeft = tab.offsetLeft;
                    tabIndicator.style.width = `${tabWidth}px`;
                    tabIndicator.style.left = `${tabLeft}px`;
                    updateMediaVisibility();
                });
            });

            if (filterButtons.length > 0) {
                filterButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const type = button.dataset.type;
                        button.classList.toggle('active');
                        if (activeFilters.includes(type)) {
                            activeFilters = activeFilters.filter(t => t !== type);
                        } else {
                            activeFilters.push(type);
                        }
                        updateMediaVisibility();
                    });
                });
            }

            const activeTab = tabsSection.querySelector('.tab.active');
            if (activeTab) {
                tabIndicator.style.width = `${activeTab.offsetWidth}px`;
                tabIndicator.style.left = `${activeTab.offsetLeft}px`;
                const initialContentId = activeTab.dataset.tab;
                const initialContent = document.getElementById(initialContentId);
                if (initialContent) {
                    initialContent.classList.add('active');
                }
            }
            updateMediaVisibility();
        }
    }

    // --- FAQ DROPDOWN ---
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");
        if (question) {
            question.addEventListener("click", () => {
                item.classList.toggle("active");
            });
        }
    });

    // --- TROCA DE VÍDEOS NA SEÇÃO DE RECURSOS ---
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
        const featureItems = featuresSection.querySelectorAll('.feature-item');
        const featureVideo = featuresSection.querySelector('#feature-video');

        if (featureItems.length > 0 && featureVideo) {
            featureItems.forEach(item => {
                item.addEventListener('click', function () {
                    featureItems.forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    const videoSrc = this.getAttribute('data-video');
                    const sourceElement = featureVideo.querySelector('source');
                    if (sourceElement && videoSrc && videoSrc.trim() !== "") {
                        sourceElement.setAttribute('src', videoSrc);
                        featureVideo.load();
                        featureVideo.play().catch(err => console.log("Erro ao tentar reproduzir vídeo de recurso: ", err));
                    } else if (featureVideo && (!videoSrc || videoSrc.trim() === "")) {
                        featureVideo.pause();
                    }
                });
            });
            const defaultFeatureItem = featuresSection.querySelector('.feature-item[data-video="videos/estante.mp4"]');
            if (defaultFeatureItem) {
                defaultFeatureItem.click();
            }
        }
    }

    // --- INICIALIZAÇÃO DA SEÇÃO DE EXEMPLOS DE RECOMENDAÇÃO ---
    const recomendacaoSection = document.querySelector('#recomendacao');
    if (recomendacaoSection) {
        const buttons = recomendacaoSection.querySelectorAll('.exemplo-btn');
        buttons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                clearTimeout(autoSwitchTimeoutExemploRecomendacao);
                mudarExemploRecomendacao(index);
                if (isSectionVisibleExemploRecomendacao) {
                    autoSwitchTimeoutExemploRecomendacao = setTimeout(autoMudarExemploRecomendacao, timerDurationExemploRecomendacao);
                }
            });
        });
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    isSectionVisibleExemploRecomendacao = entry.isIntersecting;
                    clearTimeout(autoSwitchTimeoutExemploRecomendacao);
                    if (isSectionVisibleExemploRecomendacao) {
                        autoSwitchTimeoutExemploRecomendacao = setTimeout(autoMudarExemploRecomendacao, timerDurationExemploRecomendacao);
                    }
                });
            }, { threshold: 0.5 }
        );
        observer.observe(recomendacaoSection);
        mudarExemploRecomendacao(0);
    }

    // --- FORMULÁRIO BETA TESTER ---
    const betaForm = document.getElementById('betaForm');
    if (betaForm) {
        const emailInput = betaForm.querySelector('#email');
        const deviceSelect = betaForm.querySelector('#device');
        const successMsg = document.getElementById('successMsg'); // Pode estar fora do form, por isso getElementById

        betaForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!emailInput) return;
            const email = emailInput.value.trim();
            if (!validateEmail(email)) {
                alert('Por favor, insira um e-mail válido.');
                return;
            }
            console.log('Email para Beta Test:', email);
            console.log('Dispositivo selecionado:', deviceSelect ? deviceSelect.value : 'N/A');
            emailInput.value = '';
            if (deviceSelect) {
                deviceSelect.value = '';
                deviceSelect.style.color = '#b0b0b0';
            }
            if (successMsg) {
                successMsg.style.display = 'block';
                setTimeout(() => {
                    successMsg.style.display = 'none';
                }, 5000);
            }
        });

        if (deviceSelect) {
            deviceSelect.style.color = deviceSelect.value === '' ? '#b0b0b0' : '#fff';
            deviceSelect.addEventListener('change', function() {
                this.style.color = this.value === '' ? '#b0b0b0' : '#fff';
            });
        }
    }

    // --- BOTÃO LOGIN (DESKTOP E MOBILE) SCROLL PARA SEÇÃO BETA ---
    const loginBtnDesktop = document.querySelector('.login-btn'); // Botão do header desktop
    if (loginBtnDesktop) {
        // O seu HTML para este botão tem: onclick="window.open('beta.html', '_blank')"
        // Se quiser que ele role para a seção #beta-tester NA MESMA PÁGINA,
        // você precisará remover o onclick e adicionar o listener abaixo.
        // Por enquanto, vou manter a lógica de scroll para o botão mobile.
        // loginBtnDesktop.addEventListener('click', (e) => {
        //     e.preventDefault();
        //     const betaTesterSection = document.getElementById('beta-tester'); // Assumindo que você terá essa seção na mesma página.
        //     if (betaTesterSection) {
        //         betaTesterSection.scrollIntoView({ behavior: 'smooth' });
        //     }
        // });
    }

    const loginBtnMobile = document.querySelector('.login-btn-mobile'); // Botão dentro do menu mobile
    if (loginBtnMobile) {
        loginBtnMobile.addEventListener('click', (e) => {
            // Se beta.html for uma página separada, o comportamento abaixo não se aplicará diretamente.
            // Se '#beta-tester' estiver na mesma página:
            // e.preventDefault(); // Remova se for para abrir beta.html
            const betaTesterSection = document.getElementById('beta-tester'); // ID da sua seção beta-tester
            if (betaTesterSection) {
                 betaTesterSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Se a seção beta-tester não estiver na página atual, abrir beta.html
                 window.location.href = 'beta.html'; // Ou window.open('beta.html', '_self');
            }


            // Fecha o menu mobile se estiver aberto
            let menu = document.querySelector(".mobile-menu");
            if (menu && menu.style.display === "block") {
                toggleMenu();
            }
        });
    }

    // --- SCROLL SUAVE PARA ÂNCORAS ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || this.closest('.tabs-section')) { // Ignora links vazios ou de tabs
                return;
            }
            try {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    // O menu mobile será fechado pela lógica específica adicionada aos .mobile-menu ul li a
                }
            } catch (error) {
                console.warn(`Elemento âncora não encontrado ou href inválido: ${href}`, error);
            }
        });
    });

}); // Fim do DOMContentLoaded