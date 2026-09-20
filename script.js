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
        const header = document.querySelector('header');
        if (header) {
            header.classList.remove('header-hidden');
        }
    }
}

// -----------------------------------------------------------------------------
// EVENTO DOMCONTENTLOADED PRINCIPAL
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {

    // Coordenadas em pixels reais mantem o desfoque suave em qualquer largura.
    // A geometria muda apenas no resize; a animacao continua inteiramente no CSS.
    document.querySelectorAll('.diagonal-energy-svg').forEach(function (svg) {
        function dimensionar() {
            const largura = svg.getBoundingClientRect().width;
            if (!largura) return;
            svg.setAttribute('viewBox', '0 0 ' + largura + ' 120');
            svg.querySelector('defs path').setAttribute('d', 'M 0 118 H ' + largura);
            svg.querySelectorAll('filter').forEach(f => f.setAttribute('width', largura + 160));
            const passo = largura / 4;
            svg.querySelectorAll('.diagonal-sparks').forEach(function (path, i) {
                const alturas = [[108, 100], [88, 99], [64, 80]][i];
                const y = alturas[0];
                path.setAttribute('d', 'M 0 ' + y + ' Q ' + passo / 2 + ' ' + alturas[1] + ' ' + passo + ' ' + y + ' T ' + passo * 2 + ' ' + y + ' T ' + passo * 3 + ' ' + y + ' T ' + largura + ' ' + y);
            });
        }
        dimensionar();
        if ('ResizeObserver' in window) new ResizeObserver(dimensionar).observe(svg);
        else window.addEventListener('resize', dimensionar);
    });

    // Cada efeito pausa fora da tela ou com a aba oculta. A .desc entra inteira:
    // sao perto de 200 animacoes infinitas que antes rodavam ate com a pessoa
    // parada no hero.
    document.querySelectorAll('.hero-portal-halo, .hero-portal-light, .hero h1, .hero .cta-button, .diagonal-energy, .desc').forEach(function (efeito) {
        let visivel = true;
        function atualizarEfeito() {
            efeito.classList.toggle('is-paused', !visivel || document.hidden);
        }

        if ('IntersectionObserver' in window) {
            const observador = new IntersectionObserver(function (entradas) {
                visivel = entradas[0].isIntersecting;
                atualizarEfeito();
            });
            observador.observe(efeito);
        }

        document.addEventListener('visibilitychange', atualizarEfeito);
        atualizarEfeito();
    });

    // --- VIDEO DO PERFIL: so comeca a baixar perto da tela ---
    // O <video> ja nasce com autoplay/muted/playsinline no HTML, que e o que o
    // WebKit honra; o que segura o download e que as <source> nao tem src ate
    // o video chegar perto da tela (data-src). Ao preencher o src, o navegador
    // roda a selecao de midia de novo e o autoplay dispara sozinho. O play()
    // no fim e so garantia pro Chrome; no Safari sem gesto ele pode ser
    // recusado, e tudo bem: o autoplay ja cuidou.
    document.querySelectorAll('.fone-tela video').forEach(function (video) {
        function ligar() {
            video.muted = true; // Safari confere a propriedade, nao so o atributo
            video.querySelectorAll('source[data-src]').forEach(function (source) {
                source.src = source.dataset.src;
                source.removeAttribute('data-src');
            });
            video.load();
            var tentativa = video.play();
            if (tentativa && tentativa.catch) tentativa.catch(function () {});
        }

        if (!('IntersectionObserver' in window)) {
            ligar();
            return;
        }

        const observador = new IntersectionObserver(function (entradas) {
            if (!entradas[0].isIntersecting) return;
            observador.disconnect(); // uma vez so
            ligar();
        }, { rootMargin: '200px 0px' });
        observador.observe(video);
    });

    // --- HEADER INTELIGENTE: ESCONDE AO DESCER E REAPARECE AO SUBIR ---
    const siteHeader = document.querySelector('header');
    const mobileMenu = document.querySelector('.mobile-menu');
    let lastScrollY = window.scrollY;
    let accumulatedScrollDelta = 0;
    let lastScrollDirection = 0;
    let headerScrollTicking = false;

    // Histerese: esconder exige um gesto claro para baixo, reaparecer
    // responde rapido. Limiares curtos demais fazem o header piscar e e
    // isso que dava a sensacao de animacao cortada.
    const HEADER_HIDE_DISTANCE = 64;
    const HEADER_SHOW_DISTANCE = 22;
    const HEADER_FLICK_DISTANCE = 14; // subida rapida num frame revela na hora
    const HEADER_TOP_ZONE = 24;

    function setHeaderHidden(hidden) {
        if (siteHeader.classList.contains('header-hidden') === hidden) {
            return;
        }
        siteHeader.classList.toggle('header-hidden', hidden);
        accumulatedScrollDelta = 0;
    }

    function updateHeaderVisibility() {
        headerScrollTicking = false;

        if (!siteHeader) {
            return;
        }

        // Trava o valor dentro do range real da pagina para o bounce do iOS
        // (scroll negativo ou alem do fim) nao disparar transicoes.
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const currentScrollY = Math.min(Math.max(window.scrollY, 0), maxScroll);
        const scrollDelta = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        if (scrollDelta === 0) {
            return;
        }

        const scrollDirection = Math.sign(scrollDelta);
        const mobileMenuIsOpen = mobileMenu && mobileMenu.style.display === 'block';

        if (scrollDirection !== lastScrollDirection) {
            accumulatedScrollDelta = 0;
            lastScrollDirection = scrollDirection;
        }

        accumulatedScrollDelta += scrollDelta;

        if (currentScrollY <= HEADER_TOP_ZONE || mobileMenuIsOpen) {
            setHeaderHidden(false);
            accumulatedScrollDelta = 0;
            return;
        }

        if (scrollDelta <= -HEADER_FLICK_DISTANCE || accumulatedScrollDelta <= -HEADER_SHOW_DISTANCE) {
            setHeaderHidden(false);
        } else if (accumulatedScrollDelta >= HEADER_HIDE_DISTANCE && currentScrollY > siteHeader.offsetHeight * 1.5) {
            setHeaderHidden(true);
        }
    }

    window.addEventListener('scroll', function () {
        if (!headerScrollTicking) {
            window.requestAnimationFrame(updateHeaderVisibility);
            headerScrollTicking = true;
        }
    }, { passive: true });

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

    // --- REVELACAO NA ROLAGEM ---
    // Cada grupo entra escalonado quando encosta na tela. O estado escondido e
    // aplicado aqui, e nao no CSS: assim a pagina continua legivel se o script
    // nao rodar.
    (function () {
        if (typeof IntersectionObserver === 'undefined') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // [seletor, escalonamento em ms, modo]. O modo 'fade' e obrigatorio nos
        // blocos que o proprio JS mede depois: translate entra no
        // getBoundingClientRect e desalinharia os tracos e as luzes.
        // O 4o campo, opcional, e um atraso inicial: serve pra encadear grupos
        // vizinhos numa ordem so, em vez de todos partirem juntos do zero.
        const GRUPOS = [
            ['.camada', 70, 'sobe'],
            ['.midias-texto > h2, .midias-texto > p', 90, 'sobe'],
            ['.midias-secao', 70, 'sobe'],
            ['.midias-palco', 0, 'sobe'],
            ['.vitrine-head-texto, .vitrine-setas', 90, 'sobe'],
            ['.vitrine-card', 55, 'sobe'],
            ['.hype-texto, .hype-nivel', 90, 'sobe'],
            ['.hype-card', 80, 'sobe'],
            // Gamificacao em partes: o titulo abre, o cartao acende e so entao
            // a identidade, a carteira e a fila de desbloqueios entram por
            // dentro dele. O medidor NAO esta aqui de proposito -- ele tem a
            // entrada propria (enche de 0 ate o valor) la na secao do resgate.
            ['.game-copy > h2, .game-copy > p', 110, 'sobe'],
            ['.xp-profile', 0, 'fade'],
            ['.xp-avatar', 0, 'pop', 90],
            ['.xp-username', 0, 'sobe', 160],
            ['.xp-level-badge', 0, 'pop', 240],
            // :not([hidden]) e avaliado agora, antes da gamificacao iniciar:
            // as moedas ainda travadas ficam de fora e nunca herdam o opacity 0
            // -- se herdassem, nasceriam invisiveis ao serem desbloqueadas.
            ['.xp-carteira .xp-saldo:not([hidden])', 80, 'pop', 320],
            ['.xp-progress-heading', 0, 'fade', 420],
            ['.xp-unlocks > p', 0, 'sobe'],
            ['.xp-slot', 110, 'sobe', 60],
            ['.xp-futuros li', 70, 'sobe'],
            ['.xp-actions-top', 0, 'sobe'],
            ['.xp-panel', 0, 'fade', 90],
            ['.desc-texto, .desc-poco', 110, 'sobe'],
            ['.fechamento-wrap', 0, 'fade'],
            ['.rodape-topo, .rodape-base', 110, 'sobe']
        ];

        document.documentElement.classList.add('js-revela');

        // Terminada a entrada, o elemento perde as classes e volta a ser ele
        // mesmo. Sem isso o animation-fill-mode: both congelaria transform: none
        // pra sempre, e qualquer transform de hover que a caixa tenha ficaria
        // bloqueado.
        const NOMES_REVELA = ['revelaSobe', 'revelaFade', 'revelaPop'];

        function limpar(e) {
            if (NOMES_REVELA.indexOf(e.animationName) === -1) return;
            e.target.classList.remove('revela', 'revela--fade', 'revela--pop', 'is-visivel');
            e.target.style.removeProperty('--atraso-revela');
            e.target.removeEventListener('animationend', limpar);
        }

        const observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (!entrada.isIntersecting) return;
                entrada.target.addEventListener('animationend', limpar);
                entrada.target.classList.add('is-visivel');
                observador.unobserve(entrada.target); // uma vez so
            });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });

        GRUPOS.forEach(function (grupo) {
            const itens = document.querySelectorAll(grupo[0]);
            const base = grupo[3] || 0;
            Array.prototype.forEach.call(itens, function (el, i) {
                el.classList.add('revela');
                if (grupo[2] === 'fade') el.classList.add('revela--fade');
                if (grupo[2] === 'pop') el.classList.add('revela--pop');
                const atraso = base + i * grupo[1];
                if (atraso) el.style.setProperty('--atraso-revela', atraso + 'ms');
                observador.observe(el);
            });
        });
    })();

    // --- A VAGA DO UNWIND NO TOQUE ---
    // No desktop o mistério se resolve no hover: o "?" vira Unwind quando o
    // cursor chega. Sem cursor não havia gatilho, e a vaga nascia já revelada
    // -- ou seja, o efeito não acontecia. Aqui quem dispara é a rolagem: o
    // card entra na tela como buraco, o visitante lê o "?", e só então ele
    // vira marca. .is-revelada divide as declarações com o :hover no CSS, então
    // os dois caminhos chegam exatamente no mesmo estado final.
    (function () {
        if (typeof IntersectionObserver === 'undefined') return;
        if (!window.matchMedia('(hover: none)').matches) return;

        const vaga = document.querySelector('.camada--vaga');
        if (!vaga) return;

        // Sem movimento, sem suspense: revela de imediato.
        const parado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // 0.6 do card visível, e não qualquer pedaço: a pausa só vale se o "?"
        // estiver realmente em tela durante ela.
        new IntersectionObserver(function (entradas, observador) {
            entradas.forEach(function (entrada) {
                if (!entrada.isIntersecting) return;
                observador.unobserve(entrada.target);
                setTimeout(function () {
                    entrada.target.classList.add('is-revelada');
                }, parado ? 0 : 900);
            });
        }, { threshold: 0.6 }).observe(vaga);
    })();

    // --- ANO DO COPYRIGHT ---
    // O HTML ja nasce com 2026 escrito; isso aqui so evita que o rodape
    // envelheca sozinho na virada do ano.
    const ano = document.getElementById('ano');
    if (ano) ano.textContent = new Date().getFullYear();

    // --- BOTAO "ENTRAR NO BETA" DO MENU MOBILE ---
    // Abre em aba nova, igual ao botao do header no desktop, e fecha o menu.
    const loginBtnMobile = document.querySelector('.login-btn-mobile');
    if (loginBtnMobile) {
        loginBtnMobile.addEventListener('click', () => {
            window.open('beta.html', '_blank', 'noopener');
            const menu = document.querySelector(".mobile-menu");
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

    // --- SEÇÃO DAS CAMADAS: as frases se escrevem do zero na primeira descida ---
    (function () {
        const secao = document.querySelector('.camadas');
        if (!secao) return;

        const linhas = Array.from(secao.querySelectorAll('.camadas-linhas span'));
        const resposta = secao.querySelector('.camadas-resposta');
        if (!linhas.length) return;

        // Sem suporte ou com movimento reduzido: não mexe em nada, o texto já está lá.
        if (typeof IntersectionObserver === 'undefined') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Se a seção já está em tela (reload no meio da página, link direto), não
        // esvazia nada — apagar texto que o usuário já pode estar lendo é pior
        // que perder o efeito.
        if (secao.getBoundingClientRect().top < window.innerHeight * 0.6) return;

        const textos = linhas.map(linha => linha.textContent.trim());

        function digitar(i) {
            if (i >= linhas.length) {
                if (resposta) resposta.classList.add('is-revelada');
                return;
            }
            const linha = linhas[i];
            const texto = textos[i];
            let n = 0;

            linha.classList.add('is-digitando');
            (function passo() {
                linha.textContent = texto.slice(0, ++n);
                if (n < texto.length) {
                    // Pausa no ponto final: é o respiro que faz soar como fala.
                    setTimeout(passo, texto.charAt(n - 1) === '.' ? 190 : 26);
                } else {
                    linha.classList.remove('is-digitando');
                    setTimeout(function () { digitar(i + 1); }, 200);
                }
            })();
        }

        function preparar() {
            // Trava a altura ANTES de esvaziar, senão a seção encolhe e a página
            // pula enquanto digita.
            linhas.forEach(function (linha) {
                linha.style.minHeight = linha.offsetHeight + 'px';
            });

            secao.classList.add('camadas--maquina');
            linhas.forEach(function (linha) { linha.textContent = ''; });

            const observador = new IntersectionObserver(function (entradas) {
                entradas.forEach(function (entrada) {
                    if (!entrada.isIntersecting) return;
                    observador.disconnect(); // só na primeira vez
                    digitar(0);
                });
            }, { threshold: 0.25 });

            observador.observe(secao);
        }

        // Medir altura antes da Cal Sans carregar dá número errado.
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(preparar);
        } else {
            preparar();
        }
    })();

    // --- CAMPO DE LUZES QUE ACENDE SOB O CURSOR ---
    // Grade desalinhada de halos cobrindo o fundo da secao, do teto informado
    // ate o pe dela. Os pontos respiram sozinhos e acendem conforme o cursor
    // se aproxima.
    function campoDeLuzes(cfg) {
        const secao = document.querySelector(cfg.secao);
        const teto = cfg.teto ? secao && secao.querySelector(cfg.teto) : null;
        if (!secao) return;
        if (typeof IntersectionObserver === 'undefined') return;

        // RGB em componentes: o CSS monta rgba() a partir daqui.
        const COR = '16, 123, 230';  // azul da marca, o mesmo do titulo do hero
        const QUANTIDADE = cfg.quantidade || 14;
        const RAIO_MOUSE = 340;  // px de alcance do cursor
        const ARRASTO = 15;      // px que a luz caminha na direção do cursor
        const AMBIENTE = 0.16;   // brilho de repouso, pra não ficar morto sem mouse

        const camada = document.createElement('div');
        camada.className = 'campo-luzes';
        camada.setAttribute('aria-hidden', 'true');

        const luzes = [];
        for (let i = 0; i < QUANTIDADE; i++) {
            const el = document.createElement('span');
            el.className = 'campo-luz';
            el.style.setProperty('--cor', COR);
            if (cfg.nucleo) el.style.setProperty('--n', cfg.nucleo);
            camada.appendChild(el);
            luzes.push({
                el: el,
                ang: (i / QUANTIDADE) * Math.PI * 2 - Math.PI / 2,
                fase: Math.random() * Math.PI * 2,
                // Desalinho sorteado UMA vez, no nascimento: se fosse sorteado a
                // cada posicionar(), o campo saltaria a cada resize. +-20% da
                // celula e o teto -- mais que isso e dois nucleos se encostam e
                // o brilho soma em cima do texto.
                jx: (Math.random() - 0.5) * 0.4,
                jy: (Math.random() - 0.5) * 0.4,
                x: 0, y: 0, dx: 0, dy: 0, luz: 0
            });
        }
        secao.insertBefore(camada, secao.firstChild);

        // Grade desalinhada, tirada das caixas reais, entao acompanha qualquer
        // breakpoint.
        function posicionar() {
            const s = secao.getBoundingClientRect();
            const estreito = s.width < 700;
            const yTeto = teto ? teto.getBoundingClientRect().bottom - s.top : 0;
            const alturaCampo = Math.max(80, s.height - yTeto);
            // Colunas pela proporcao da area: assim a celula sai quase quadrada
            // em qualquer tela, com o numero de pontos fixo.
            const colunas = Math.max(2, Math.round(
                Math.sqrt(luzes.length * s.width / alturaCampo)));
            const linhas = Math.ceil(luzes.length / colunas);
            const cw = s.width / colunas;
            const ch = alturaCampo / linhas;
            const tam = Math.min(cw, ch) * (estreito ? 1.5 : 1.75);

            luzes.forEach(function (luz, i) {
                const col = i % colunas;
                const lin = Math.floor(i / colunas);
                // A ultima linha quase nunca fecha a grade -- 48 pontos em 10
                // colunas deixam duas celulas sobrando no fim dela. Cada linha
                // reparte a largura entre os pontos que ELA tem, entao a de
                // baixo se espalha e o canto nao fica vazio.
                const nesta = Math.min(colunas, luzes.length - lin * colunas);
                const cwLinha = s.width / nesta;
                luz.el.style.setProperty('--tam',
                    Math.round(tam * (0.8 + (i % 4) * 0.15)) + 'px');
                luz.x = (col + 0.5 + luz.jx) * cwLinha;
                luz.y = yTeto + (lin + 0.5 + luz.jy) * ch;
            });
        }

        const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let cursorX = 0, cursorY = 0, temCursor = false;
        let rodando = false, t = 0, ultimoQuadro = 0;

        function quadro(agora) {
            if (!rodando) return;
            // Tempo real, nao contagem de quadros: com o navegador preso em 30fps
            // (bateria, economia de energia) o respiro andava na metade da
            // velocidade, e em tela de 120Hz no dobro. O teto de 100ms evita o
            // salto no primeiro quadro depois de a secao voltar pra tela.
            const dt = ultimoQuadro ? Math.min(agora - ultimoQuadro, 100) / 1000 : 1 / 60;
            ultimoQuadro = agora;
            t += dt;
            // 0.12 por quadro era a suavizacao calibrada a 60fps; aqui ela vira
            // o equivalente pro dt real.
            const suave = 1 - Math.pow(1 - 0.12, dt * 60);

            for (let i = 0; i < luzes.length; i++) {
                const luz = luzes[i];
                const respiro = AMBIENTE + Math.sin(t * 0.8 + luz.fase) * 0.05;
                let alvoLuz = respiro, ax = 0, ay = 0;

                if (temCursor) {
                    const dx = cursorX - luz.x;
                    const dy = cursorY - luz.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < RAIO_MOUSE) {
                        const forca = Math.pow(1 - d / RAIO_MOUSE, 2); // queda suave
                        alvoLuz = Math.min(1, respiro + forca);
                        ax = (dx / (d || 1)) * forca * ARRASTO;
                        ay = (dy / (d || 1)) * forca * ARRASTO;
                    }
                }

                luz.luz += (alvoLuz - luz.luz) * suave;
                luz.dx += (ax - luz.dx) * suave;
                luz.dy += (ay - luz.dy) * suave;

                luz.el.style.transform =
                    'translate(' + (luz.x + luz.dx).toFixed(2) + 'px,' +
                    (luz.y + luz.dy).toFixed(2) + 'px) scale(' +
                    (0.85 + luz.luz * 0.5).toFixed(3) + ')';
                luz.el.style.opacity = luz.luz.toFixed(3);
            }

            requestAnimationFrame(quadro);
        }

        function estatico() {
            posicionar();
            luzes.forEach(function (luz) {
                luz.el.style.transform = 'translate(' + luz.x + 'px,' + luz.y + 'px)';
                luz.el.style.opacity = AMBIENTE;
            });
        }

        secao.addEventListener('pointermove', function (e) {
            const s = secao.getBoundingClientRect();
            cursorX = e.clientX - s.left;
            cursorY = e.clientY - s.top;
            temCursor = true;
        });
        secao.addEventListener('pointerleave', function () { temCursor = false; });

        window.addEventListener('resize', function () {
            if (semMovimento) { estatico(); } else { posicionar(); }
        });

        function iniciar() {
            posicionar();
            if (semMovimento) { estatico(); return; }
            // Só gasta quadro enquanto a seção está em tela.
            const observador = new IntersectionObserver(function (entradas) {
                entradas.forEach(function (entrada) {
                    if (entrada.isIntersecting) {
                        if (!rodando) { rodando = true; ultimoQuadro = 0; requestAnimationFrame(quadro); }
                    } else {
                        rodando = false;
                    }
                });
            }, { threshold: 0 });
            observador.observe(secao);
        }

        // Medir antes das fontes carregarem dá elipse errada.
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(iniciar);
        } else {
            iniciar();
        }
    }

    // Fechamento: campo de luzes cobrindo o fundo, do pe do titulo ate o pe da
    // secao. Nucleo menor que o do anel porque aqui os halos se cruzam e o
    // brilho soma -- com 0.5 dois pontos vizinhos em cima do subtitulo o
    // derrubariam abaixo do minimo de contraste.
    campoDeLuzes({
        secao: '.fechamento',
        teto: '.fechamento-titulo',
        quantidade: 48,
        nucleo: 0.88
    });


    // --- VITRINE DE CONTEÚDOS: clique e seta fixam o card aberto ---
    (function () {
        const vitrine = document.querySelector('.vitrine');
        if (!vitrine) return;
        const cards = Array.from(vitrine.querySelectorAll('.vitrine-card'));
        if (!cards.length) return;

        // Abrir e so aqui: clique no card ou nas setas. O hover apenas realca (CSS).
        function ativar(alvo) {
            cards.forEach(function (c) {
                const ativo = c === alvo;
                c.classList.toggle('is-ativo', ativo);
                c.setAttribute('aria-pressed', ativo ? 'true' : 'false');
            });
        }

        cards.forEach(function (card) {
            card.addEventListener('click', function () { ativar(card); });
        });

        document.querySelectorAll('.vitrine-seta').forEach(function (seta) {
            seta.addEventListener('click', function () {
                const dir = Number(seta.dataset.dir) || 1;
                const i = cards.findIndex(function (c) {
                    return c.classList.contains('is-ativo');
                });
                // + cards.length antes do modulo: em JS -1 % 10 da -1, nao 9
                ativar(cards[(i + dir + cards.length) % cards.length]);
            });
        });
    })();

    // --- HYPE: medidor global que enche conforme a secao sobe na tela ---
    (function () {
        const secao = document.querySelector('.hype');
        const nivel = secao && secao.querySelector('.hype-nivel');
        if (!secao || !nivel) return;

        const barra = nivel.querySelector('.hype-nivel-trilha span');
        const valor = nivel.querySelector('.hype-nivel-valor');

        let ultimoPct = -1;
        function pintar(pct) {
            // Mesmo valor nao reescreve: textContent igual ainda troca o no de
            // texto e invalida o layout a cada quadro de rolagem.
            if (pct === ultimoPct) return;
            ultimoPct = pct;
            if (barra) barra.style.width = pct + '%';
            if (valor) valor.textContent = pct + '%';
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            pintar(100);
            return;
        }

        let pendente = false;

        function atualizar() {
            pendente = false;
            // Medido na PROPRIA barra, nao na secao: a secao comeca 12vh acima
            // dela, entao usar o topo da secao ja dava porcentagem cheia antes
            // da barra sequer aparecer.
            const topo = nivel.getBoundingClientRect().top;
            const altura = window.innerHeight;
            // 0% com a barra encostando na base da tela; 100% quando ela sobe
            // ate 30% da altura.
            const p = (altura - topo) / (altura * 0.7);
            pintar(Math.round(Math.max(0, Math.min(1, p)) * 100));
        }

        // So mede com a barra perto da tela. Longe dela o valor ja esta travado
        // em 0 ou 100, e a pagina inteira pagava um getBoundingClientRect por
        // quadro de rolagem a toa. Ao sair da margem, uma ultima medida fecha
        // o valor no extremo certo mesmo numa rolagem rapida.
        let perto = true;
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entradas) {
                perto = entradas[0].isIntersecting;
                atualizar();
            }, { rootMargin: '50% 0px' }).observe(nivel);
        }

        window.addEventListener('scroll', function () {
            if (perto && !pendente) { pendente = true; requestAnimationFrame(atualizar); }
        }, { passive: true });
        window.addEventListener('resize', atualizar);
        atualizar();
    })();

    // --- HYPE: contagem regressiva na pill ao lado do tipo de midia ---
    (function () {
        const cards = Array.from(document.querySelectorAll('.hype-card'));
        if (!cards.length) return;

        const alvos = [];

        cards.forEach(function (card) {
            const img = card.querySelector('img');
            // Capa ausente: tira a <img> e deixa o gradiente do .hype-capa
            // aparecer, em vez de icone quebrado.
            if (img) img.addEventListener('error', function () { img.remove(); });

            const saida = card.querySelector('[data-tempo]');
            const iso = card.dataset.lancamento;

            if (!iso) {
                card.classList.add('sem-data');
                if (saida) saida.textContent = 'A anunciar';
                return;
            }

            // Montado como data LOCAL: new Date('2026-11-19') seria meia-noite
            // UTC e, em fuso negativo, cairia no dia anterior.
            const p = iso.split('-').map(Number);
            alvos.push({ card: card, saida: saida, alvo: new Date(p[0], p[1] - 1, p[2]) });
        });

        const dois = function (n) { return String(n).padStart(2, '0'); };

        function tick() {
            const agora = Date.now();
            alvos.forEach(function (item) {
                if (!item.saida) return;
                const resta = item.alvo.getTime() - agora;
                if (resta <= 0) {
                    item.card.classList.add('lancado');
                    item.saida.textContent = 'Lançado';
                    return;
                }
                const min = Math.floor(resta / 60000);
                item.saida.textContent =
                    Math.floor(min / 1440) + 'd ' +
                    dois(Math.floor(min % 1440 / 60)) + 'h ' +
                    dois(min % 60) + 'm';
            });
        }

        tick();
        // 30s: o menor campo exibido e minuto, entao nao ha ganho em ir mais fino.
        if (alvos.length) setInterval(tick, 30000);
    })();

    // --- GAMIFICACAO: resgates unicos; recarregar reinicia a demonstracao. ---
    (function () {
        const secao = document.querySelector('#gamificacao');
        if (!secao) return;
        const perfil = secao.querySelector('.xp-profile');
        const barra = secao.querySelector('.xp-meter');
        const preenchimento = barra.querySelector('.xp-meter-fill');
        const numero = secao.querySelector('.xp-current');
        const teto = secao.querySelector('.xp-total');
        const selo = secao.querySelector('.xp-level-badge');
        const ganho = secao.querySelector('.xp-profile-gain');
        const trilha = secao.querySelector('.xp-action-track');
        const cards = Array.from(secao.querySelectorAll('.xp-action'));
        const slots = Array.from(secao.querySelectorAll('.xp-slot'));
        const fichas = secao.querySelector('.xp-fichas');
        // Moedas que so entram na carteira depois do nivel que as libera.
        const carteira = Array.from(secao.querySelectorAll('.xp-saldo[data-unlock-level]'));
        const anterior = secao.querySelector('.xp-prev');
        const seguinte = secao.querySelector('.xp-next');
        const aviso = secao.querySelector('.xp-live');
        const movimento = window.matchMedia('(prefers-reduced-motion: reduce)');
        const INICIO = 600, NIVEL_INICIAL = 5;
        const FICHAS_INICIAIS = 6250, FICHAS_POR_NIVEL = 250;
        const limite = n => 2500 + (n - NIVEL_INICIAL) * 1000;
        const resgatados = new Set();
        let ocupado = false;

        const compacto = valor => (Math.round(valor) / 1000).toFixed(3) + 'K';
        const pontos = valor => Number(valor).toLocaleString('pt-BR');
        function saldo() { return INICIO + cards.reduce((soma, c) => soma + (resgatados.has(c.dataset.reward) ? Number(c.dataset.up) : 0), 0); }
        function estado(total) {
            let n = NIVEL_INICIAL;
            while (total >= limite(n)) { total -= limite(n); n++; }
            return { nivel: n, up: total, max: limite(n) };
        }
        function pintar(up, max) {
            numero.textContent = compacto(up);
            teto.textContent = compacto(max);
            // Na propria barra, e nao no .xp-profile: variavel CSS herda, entao
            // no perfil cada quadro da contagem recalculava o estilo do cartao
            // inteiro. So o .xp-meter-fill le --xp-progress.
            preenchimento.style.setProperty('--xp-progress', Math.max(0, Math.min(1, up / max)));
        }
        function nivel(n) {
            perfil.classList.toggle('is-up', n > NIVEL_INICIAL);
            perfil.classList.toggle('is-max', n >= NIVEL_INICIAL + 2);
            selo.querySelector('b').textContent = n;
            selo.setAttribute('aria-label', 'Nível ' + n);
            const moedas = pontos(FICHAS_INICIAIS + (n - NIVEL_INICIAL) * FICHAS_POR_NIVEL);
            fichas.textContent = moedas;
            fichas.closest('.xp-saldo').setAttribute('aria-label', moedas + ' fichas');
            carteira.forEach(m => { m.hidden = n < Number(m.dataset.unlockLevel); });
            const novos = [];
            slots.forEach(slot => {
                const liberado = n >= Number(slot.dataset.unlockLevel);
                if (liberado && !slot.classList.contains('is-unlocked')) novos.push(slot);
                slot.classList.toggle('is-unlocked', liberado);
                slot.querySelector('.xp-slot-status i').className = 'fa-solid ' + (liberado ? 'fa-check' : 'fa-lock');
                slot.querySelector('.xp-slot-status span').textContent = liberado ? 'Desbloqueado' : 'Nível ' + slot.dataset.unlockLevel;
                slot.setAttribute('aria-label', slot.dataset.feature + (liberado ? ': desbloqueado' : ': desbloqueia no nível ' + slot.dataset.unlockLevel));
            });
            return novos;
        }
        function atualizarAria(e) {
            barra.setAttribute('aria-valuenow', e.up);
            barra.setAttribute('aria-valuemax', e.max);
            barra.setAttribute('aria-valuetext', 'Nível ' + e.nivel + ': ' + pontos(e.up) + ' de ' + pontos(e.max) + ' UP');
        }
        function setas() {
            // Le tudo antes e so escreve o que mudou: o scroll da trilha chama
            // isto a cada quadro, e reescrever disabled igual invalidava o estilo
            // das setas sem motivo.
            const topo = trilha.scrollTop;
            const semAnterior = ocupado || topo < 3;
            const semSeguinte = ocupado || topo >= trilha.scrollHeight - trilha.clientHeight - 3;
            if (anterior.disabled !== semAnterior) anterior.disabled = semAnterior;
            if (seguinte.disabled !== semSeguinte) seguinte.disabled = semSeguinte;
        }
        function atualizarCards() {
            cards.forEach(c => {
                const feito = resgatados.has(c.dataset.reward);
                const b = c.querySelector('.xp-claim');
                c.classList.toggle('is-claimed', feito);
                b.disabled = feito || ocupado;
                b.textContent = feito ? 'Resgatado ✓' : 'Resgatar';
                b.setAttribute('aria-label', feito ? pontos(c.dataset.up) + ' UP já resgatados' : 'Resgatar ' + pontos(c.dataset.up) + ' UP: ' + c.querySelector('h3').textContent);
            });
            secao.querySelector('.xp-claim-count').textContent = resgatados.size + ' de ' + cards.length + ' resgatados';
            setas();
        }
        function animar(el, quadros, opcoes) {
            if (movimento.matches || !el.animate) return Promise.resolve();
            return el.animate(quadros, opcoes).finished.catch(() => {});
        }
        async function animarDesbloqueios(novos) {
            const entrando = novos.map(s => carteira.find(m => m.dataset.feature === s.dataset.feature)).filter(Boolean);
            entrando.forEach((m, i) => animar(m, [
                { transform: 'scale(.3)', opacity: 0 },
                { transform: 'scale(1.18)', opacity: 1, offset: .6 },
                { transform: 'scale(1)', opacity: 1 }
            ], { duration: 640, delay: i * 90, easing: 'cubic-bezier(.2,.7,.3,1)' }));
            await Promise.all(novos.map(async (slot, i) => {
                const rgb = getComputedStyle(slot).getPropertyValue('--slot-rgb');
                await Promise.all([
                    animar(slot, [
                        { transform: 'translateY(0) scale(1)', boxShadow: '0 0 0 rgba(' + rgb + ',0)' },
                        { transform: 'translateY(-4px) scale(1.035)', boxShadow: '0 0 28px rgba(' + rgb + ',.35)', offset: .4 },
                        { transform: 'translateY(0) scale(1)', boxShadow: '0 0 0 rgba(' + rgb + ',0)' }
                    ], { duration: 850, delay: i * 100, easing: 'ease-out' }),
                    animar(slot.querySelector('.xp-slot-art'), [
                        { transform: 'scale(.7) rotateY(-90deg)', filter: 'grayscale(1)', opacity: .35 },
                        { transform: 'scale(1.2) rotateY(0deg)', filter: 'grayscale(0) brightness(1.4)', opacity: 1, offset: .55 },
                        { transform: 'scale(1) rotateY(0deg)', filter: 'grayscale(0)', opacity: 1 }
                    ], { duration: 750, delay: i * 100, easing: 'cubic-bezier(.2,.7,.3,1)' })
                ]);
            }));
        }
        // Cada chamada invalida a anterior. Sem isso, a contagem de entrada e a
        // de um resgate feito no meio dela escreveriam na mesma barra ao mesmo
        // tempo, e o numero tremeria ate uma das duas acabar.
        let geracaoContagem = 0;
        function contar(de, para, max, duracao) {
            geracaoContagem++;
            const minha = geracaoContagem;
            if (movimento.matches) { pintar(para, max); return Promise.resolve(); }
            return new Promise(resolve => {
                const inicio = performance.now();
                function passo(agora) {
                    if (minha !== geracaoContagem) { resolve(); return; }
                    const t = movimento.matches ? 1 : Math.min(1, (agora - inicio) / duracao);
                    pintar(de + (para - de) * (1 - Math.pow(1 - t, 3)), max);
                    if (t < 1) requestAnimationFrame(passo); else resolve();
                }
                requestAnimationFrame(passo);
            });
        }
        async function transferir(card, valor) {
            if (movimento.matches) return;
            const origem = card.querySelector('.xp-claim').getBoundingClientRect();
            const destino = barra.getBoundingClientRect();
            const x = origem.left + origem.width / 2;
            const y = origem.top;
            const fimX = destino.left + destino.width * 0.8;
            const fimY = destino.top;
            const tema = getComputedStyle(card);
            const voos = [];
            for (let i = 0; i < 5; i++) {
                const el = document.createElement('span');
                el.className = 'xp-flight' + (i ? ' xp-flight--spark' : '');
                el.style.setProperty('--mission-color', tema.getPropertyValue('--mission-color'));
                el.style.setProperty('--mission-rgb', tema.getPropertyValue('--mission-rgb'));
                el.setAttribute('aria-hidden', 'true');
                if (!i) el.textContent = '+' + pontos(valor) + ' UP';
                document.body.appendChild(el);
                const desvio = (i - 2) * 14;
                voos.push(animar(el, [
                    { transform: 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%) scale(0.7)', opacity: 0 },
                    { transform: 'translate(' + (x + desvio) + 'px,' + (y - 35) + 'px) translate(-50%,-50%) scale(1)', opacity: 1, offset: 0.18 },
                    { transform: 'translate(' + ((x + fimX) / 2 + desvio) + 'px,' + ((y + fimY) / 2 - 50) + 'px) translate(-50%,-50%) scale(0.9)', opacity: 1, offset: 0.58 },
                    { transform: 'translate(' + fimX + 'px,' + fimY + 'px) translate(-50%,-50%) scale(0.25)', opacity: 0 }
                ], { duration: 780, delay: i * 35, easing: 'ease-in-out' }).finally(() => el.remove()));
            }
            await Promise.all(voos);
        }
        function irPara(card, foco) {
            if (!card) return;
            const a = card.getBoundingClientRect(), t = trilha.getBoundingClientRect();
            const margem = parseFloat(getComputedStyle(trilha).paddingTop);
            trilha.scrollTo({ top: trilha.scrollTop + a.top - t.top - margem, behavior: movimento.matches ? 'auto' : 'smooth' });
            if (foco) card.querySelector('.xp-claim').focus({ preventScroll: true });
        }
        async function resgatar(card) {
            const id = card.dataset.reward;
            if (ocupado || resgatados.has(id)) return;
            ocupado = true;
            const antes = estado(saldo());
            const valor = Number(card.dataset.up);
            // Registra antes da animacao para impedir cliques duplicados.
            resgatados.add(id);
            const depois = estado(saldo());
            cards.forEach(c => { c.querySelector('.xp-claim').disabled = true; });
            secao.classList.add('is-busy');
            card.classList.add('is-claiming');
            card.querySelector('.xp-claim').textContent = 'Resgatando';
            setas();
            try {
                await Promise.all([
                    transferir(card, valor),
                    animar(card.querySelector('.xp-action-icon'), [{ transform: 'scale(1)' }, { transform: 'scale(1.2)', filter: 'brightness(1.3)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 600, easing: 'ease-out' }),
                    animar(card.querySelector('.xp-card-gain'), [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(-8px)', offset: 0.25 }, { opacity: 0, transform: 'translateY(-35px)' }], { duration: 820, easing: 'ease-out' })
                ]);
                ganho.textContent = '+' + pontos(valor) + ' UP';
                const pulso = animar(ganho, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(-5px)', offset: 0.2 }, { opacity: 1, offset: 0.7 }, { opacity: 0, transform: 'translateY(-18px)' }], { duration: 1200, easing: 'ease-out' });
                if (depois.nivel !== antes.nivel) {
                    for (let n = antes.nivel; n < depois.nivel; n++) {
                        await contar(n === antes.nivel ? antes.up : 0, limite(n), limite(n), 650);
                        const novos = nivel(n + 1);
                        pintar(0, limite(n + 1));
                        const rgb = getComputedStyle(perfil).getPropertyValue('--xp-rgb');
                        await Promise.all([
                            animar(selo, [{ transform: 'scale(1)' }, { transform: 'scale(1.14)', boxShadow: '0 0 38px rgba(' + rgb + ',.55)', offset: 0.4 }, { transform: 'scale(1)', boxShadow: '0 0 0 rgba(' + rgb + ',0)' }], { duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)' }),
                            animar(fichas, [{ transform: 'scale(1)' }, { transform: 'scale(1.28)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 560, easing: 'cubic-bezier(.2,.7,.3,1)' }),
                            animarDesbloqueios(novos)
                        ]);
                    }
                    await contar(0, depois.up, depois.max, 500);
                } else {
                    const rgb = getComputedStyle(perfil).getPropertyValue('--xp-rgb');
                    await Promise.all([
                        contar(antes.up, depois.up, depois.max, 780),
                        animar(barra.querySelector('.xp-meter-fill'), [{ boxShadow: '0 0 10px rgba(' + rgb + ',.35)' }, { boxShadow: '0 0 26px rgba(' + rgb + ',.85)', offset: 0.35 }, { boxShadow: '0 0 10px rgba(' + rgb + ',.35)' }], { duration: 850 })
                    ]);
                }
                await pulso;
            } finally {
                // O estado final e calculado dos IDs, independentemente da animacao.
                nivel(depois.nivel);
                pintar(depois.up, depois.max);
                atualizarAria(depois);
                ocupado = false;
                card.classList.remove('is-claiming');
                secao.classList.remove('is-busy');
                atualizarCards();
                const liberados = slots.filter(slot => Number(slot.dataset.unlockLevel) > antes.nivel && Number(slot.dataset.unlockLevel) <= depois.nivel).map(slot => slot.dataset.feature);
                aviso.textContent = pontos(valor) + ' UP resgatados. ' + (depois.nivel !== antes.nivel ? 'Você subiu para o nível ' + depois.nivel + '. ' : '') + (liberados.length ? 'Desbloqueios: ' + liberados.join(', ') + '. ' : '') + resgatados.size + ' de ' + cards.length + ' recompensas resgatadas.';
                const indice = cards.indexOf(card);
                const proximo = cards.slice(indice + 1).concat(cards.slice(0, indice)).find(c => !resgatados.has(c.dataset.reward));
                irPara(proximo, true);
            }
        }
        cards.forEach(c => c.querySelector('.xp-claim').addEventListener('click', () => { resgatar(c).catch(() => {}); }));
        trilha.addEventListener('scroll', setas, { passive: true });
        function navegar(direcao) {
            const passo = cards[0].offsetHeight + parseFloat(getComputedStyle(trilha).gap);
            trilha.scrollBy({ top: direcao * passo, behavior: movimento.matches ? 'auto' : 'smooth' });
        }
        anterior.addEventListener('click', () => navegar(-1));
        seguinte.addEventListener('click', () => navegar(1));
        window.addEventListener('resize', setas);
        const inicial = estado(saldo());
        nivel(inicial.nivel);
        // O aria ja anuncia o valor real: quem usa leitor de tela nao depende da
        // animacao pra saber onde o nivel esta.
        atualizarAria(inicial);
        atualizarCards();

        // A barra e o contador nascem zerados e sobem ate o valor real na
        // primeira vez que o cartao encosta na tela. E o que apresenta a
        // mecanica de UP: antes disso, a barra ja estava pintada em 24% desde o
        // load e a secao inteira entrava parada.
        if (movimento.matches || typeof IntersectionObserver === 'undefined') {
            pintar(inicial.up, inicial.max);
        } else {
            pintar(0, inicial.max);
            const entradaPerfil = new IntersectionObserver(function (entradas) {
                if (!entradas[0].isIntersecting) return;
                entradaPerfil.disconnect(); // uma vez so
                // Espera a revelacao do cartao antes de comecar a encher.
                setTimeout(function () {
                    // Um resgate feito nesse intervalo ja assumiu a barra a
                    // partir do valor real: a entrada perdeu a vez e voltar pro
                    // zero agora desfaria o que o usuario acabou de ganhar.
                    if (geracaoContagem > 0 || ocupado) return;
                    contar(0, inicial.up, inicial.max, 1150);
                }, 480);
            }, { threshold: 0.35 });
            entradaPerfil.observe(perfil);
        }
    })();

}); // Fim do DOMContentLoaded
