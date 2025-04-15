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
        "images/eldenRing.jpeg"
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
      estrelas: 4.5
    }
  ];

  function mudarExemplo(index) {
    const data = exemplos[index];
    document.getElementById('input-img').src = data.origem;
    document.querySelectorAll('.exemplo-grupo .pequeno').forEach((img, i) => {
      img.src = data.sugestoes[i];
    });
    document.querySelectorAll('.exemplo-btn').forEach(btn => btn.classList.remove('ativo'));
    document.querySelectorAll('.exemplo-btn')[index].classList.add('ativo');

    const avaliacao = document.getElementById('avaliacao-input');
    avaliacao.innerHTML = '';
    const cheias = Math.floor(data.estrelas);
    const meia = data.estrelas % 1 !== 0;

    for (let i = 0; i < cheias; i++) {
      avaliacao.innerHTML += '<i class="fas fa-star"></i>';
    }
    if (meia) {
      avaliacao.innerHTML += '<i class="fas fa-star-half-alt"></i>';
    }
  }