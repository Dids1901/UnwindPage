// Menu Mobile Toggle
function toggleMenu() {
    let menu = document.querySelector(".mobile-menu");
    let button = document.querySelector(".menu-toggle");

    if (menu.style.display === "block") {
        menu.style.display = "none"; 
        button.innerHTML = "☰"; // Volta para o ícone de hambúrguer
    } else {
        menu.style.display = "block"; 
        button.innerHTML = "✖"; // Muda para o X
    }
}

document.addEventListener('DOMContentLoaded', function () {
  const track = document.querySelector('.carousel-track');
  const cards = document.querySelectorAll('.carousel-card');
  const leftArrow = document.querySelector('.carousel-arrow.left');
  const rightArrow = document.querySelector('.carousel-arrow.right');
  let currentIndex = 0;
  const cardCount = cards.length;

  function updateCarousel() {
    const cardWidth = cards[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  }

  rightArrow.addEventListener('click', () => {
    if (currentIndex < cardCount - 1) {
      currentIndex++;
      updateCarousel();
    }
  });

  leftArrow.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  window.addEventListener('resize', updateCarousel);
  updateCarousel(); // Initial position
});

const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabIndicator = document.querySelector('.tab-indicator');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Initialize filters
    let activeFilters = ['game', 'movie', 'series'];

    // Function to update media visibility based on active filters
    function updateMediaVisibility() {
      const mediaItems = document.querySelectorAll('.tab-content.active .media-item');
      mediaItems.forEach(item => {
        const type = item.dataset.type;
        if (activeFilters.includes(type)) {
          item.classList.add('visible');
        } else {
          item.classList.remove('visible');
        }
      });
    }

    // Tab switching
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(tab.dataset.tab).classList.add('active');

        const tabWidth = tab.offsetWidth;
        const tabLeft = tab.offsetLeft;
        tabIndicator.style.width = `${tabWidth}px`;
        tabIndicator.style.left = `${tabLeft}px`;

        updateMediaVisibility();
      });
    });

    // Filter button toggling
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const type = button.dataset.type;
        if (activeFilters.includes(type)) {
          activeFilters = activeFilters.filter(t => t !== type);
          button.classList.remove('active');
        } else {
          activeFilters.push(type);
          button.classList.add('active');
        }
        updateMediaVisibility();
      });
    });

    // Initialize indicator position and active content
    const activeTab = document.querySelector('.tab.active');
    tabIndicator.style.width = `${activeTab.offsetWidth}px`;
    tabIndicator.style.left = `${activeTab.offsetLeft}px`;
    document.getElementById(activeTab.dataset.tab).classList.add('active');
    updateMediaVisibility();

// FAQ Dropdown
document.addEventListener("DOMContentLoaded", function () {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");

        question.addEventListener("click", () => {
            item.classList.toggle("active");
        });
    });
});



// Troca de vídeos na seção de Recursos
document.addEventListener('DOMContentLoaded', function () {
    const featureItems = document.querySelectorAll('.feature-item');
    const featureVideo = document.getElementById('feature-video');

    featureItems.forEach(item => {
        item.addEventListener('click', function () {
            featureItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            const videoSrc = this.getAttribute('data-video');

            if (videoSrc && videoSrc.trim() !== "") {
                const sourceElement = featureVideo.querySelector('source');
                sourceElement.setAttribute('src', videoSrc);
                featureVideo.load();
                featureVideo.play().catch(err => console.log("Erro ao tentar reproduzir: ", err));
            } else {
                featureVideo.pause();
            }
        });
    });

    // Seleciona automaticamente o item "shelf" (vídeo default)
    const defaultItem = document.querySelector('.feature-item[data-video="videos/estante.mp4"]');
    if (defaultItem) {
        defaultItem.click();
        featureVideo.play().catch(err => console.log("Erro ao tentar reproduzir: ", err));
    }
});

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

let currentIndex = 0;
const totalExemplos = 4;
const timerDuration = 5000; // 5 segundos
let autoSwitchTimeout;

function startTimer() {
  const circles = document.querySelectorAll('.progress-ring__circle');
  circles.forEach(circle => circle.classList.remove('active'));
  const activeCircle = circles[currentIndex];
  activeCircle.offsetWidth; // Força reflow para reiniciar animação
  activeCircle.classList.add('active');
}

function mudarExemplo(index) {
  const grupo = document.querySelector('.exemplo-grupo');
  const inputBloco = document.querySelector('.input-bloco');
  const seta = document.querySelector('.seta');
  const linhaExemplo = document.querySelector('.linha-exemplo-horizontal');
  const avaliacao = document.querySelector('#avaliacao-input');
  const body = document.body;

  // Aplica overflow-x: hidden durante a transição
  body.classList.add('no-overflow-x');

  // Remove classes de animação e seta-x
  grupo.classList.remove('animate-in');
  inputBloco.classList.remove('animate-in');
  seta.classList.remove('animate-in');
  grupo.classList.add('animate-right');
  inputBloco.classList.add('animate-right');
  seta.classList.add('animate-right');
  seta.classList.remove('seta-x');
  avaliacao.classList.remove('avaliacao-rejeitada');

  setTimeout(() => {
    grupo.innerHTML = '';
    inputBloco.style.display = 'block';
    seta.style.display = 'block';
    linhaExemplo.classList.remove('exemplo-4');

    if (index === 3) {
      inputBloco.style.display = 'none';
      seta.style.display = 'none';
      linhaExemplo.classList.add('exemplo-4');
      midiasAprovadas.forEach((sugestao, i) => {
        const outputItem = document.createElement('div');
        outputItem.classList.add('output-item');
        outputItem.style.setProperty('--offset', `${-i * 20}px`);
        outputItem.style.setProperty('--z', midiasAprovadas.length - i);
        const img = document.createElement('img');
        img.src = sugestao;
        img.alt = `Sugestão ${i + 1}`;
        img.classList.add('exemplo-img', 'pequeno');
        outputItem.appendChild(img);

        const heartOverlay = document.createElement('div');
        heartOverlay.classList.add('heart-overlay', 'show-heart');
        heartOverlay.innerHTML = '<i class="fas fa-heart"></i>';
        outputItem.appendChild(heartOverlay);

        grupo.appendChild(outputItem);
      });
    } else {
      const data = exemplos[index];
      document.getElementById('input-img').src = data.origem;

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

        grupo.appendChild(outputItem);
      });

      avaliacao.innerHTML = '';
      for (let i = 0; i < Math.floor(data.estrelas); i++) {
        avaliacao.innerHTML += '<i class="fas fa-star"></i>';
      }

      if (index === 2) {
        seta.classList.add('seta-x');
        avaliacao.classList.add('avaliacao-rejeitada'); // Aplica borda vermelha
      }
    }

    grupo.classList.remove('animate-right');
    inputBloco.classList.remove('animate-right');
    seta.classList.remove('animate-right');
    grupo.classList.add('animate-in');
    inputBloco.classList.add('animate-in');
    seta.classList.add('animate-in');

    document.querySelectorAll('.exemplo-btn').forEach(btn => btn.classList.remove('ativo'));
    document.querySelectorAll('.exemplo-btn')[index].classList.add('ativo');

    currentIndex = index;
    startTimer();

    clearTimeout(autoSwitchTimeout);
    autoSwitchTimeout = setTimeout(autoMudarExemplo, timerDuration);

    // Remove overflow-x: hidden após a transição
    setTimeout(() => {
      body.classList.remove('no-overflow-x');
    }, 500);
  }, 500);
}

function autoMudarExemplo() {
  currentIndex = (currentIndex + 1) % totalExemplos;
  mudarExemplo(currentIndex);
}

document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.exemplo-btn');
  buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      clearTimeout(autoSwitchTimeout);
      mudarExemplo(index);
    });
  });

  mudarExemplo(0);
});


  const form = document.getElementById('betaForm');
const emailInput = document.getElementById('email');
const successMsg = document.getElementById('successMsg');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const email = emailInput.value.trim();

  if (!validateEmail(email)) {
    alert('Por favor, insira um e-mail válido.');
    return;
  }

  // Aqui você pode integrar com Firebase ou outro backend
  console.log('Email enviado:', email);

  emailInput.value = '';
  successMsg.style.display = 'block';

  setTimeout(() => {
    successMsg.style.display = 'none';
  }, 5000);
});

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
const select = document.getElementById('device');
    select.addEventListener('change', function() {
      if (this.value === '') {
        this.style.color = '#b0b0b0'; // Cor do placeholder
      } else {
        this.style.color = '#fff'; // Cor das opções Android/iOS
      }
    });
    // Definir cor inicial ao carregar a página
    select.style.color = '#b0b0b0';
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.addEventListener('click', () => {
      document.getElementById('beta-tester').scrollIntoView({ behavior: 'smooth' });
    });
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault(); // Previne o comportamento padrão do link
        const targetId = this.getAttribute('href').substring(1); // Remove o '#'
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
