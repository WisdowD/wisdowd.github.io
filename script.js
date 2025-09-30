import {
    PreencheLivros,
    AddLivrosGrid,
    FecharModal,
    AddFavoritos,
    RemoveFav,
    AtualizaFav,
    CarregaFav,
    AplicarFiltros,
    LimparFiltros,
    MostrarSecao,
    BuscarLivroNoModal
} from './functions.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Script principal iniciado.');

    // === INICIALIZAÇÃO DE FAVORITOS ===
    CarregaFav();
    AtualizaFav();

    // === GERENCIAMENTO DE ABAS DE NAVEGAÇÃO ===
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = event.target.dataset.target;
            MostrarSecao(targetId);
        });
    });

    // Define a seção inicial a ser exibida (Catálogo por padrão)
    MostrarSecao('catalog');


    // === CHAMADAS PARA PREENCHER AS SEÇÕES ===
    PreencheLivros('mais-vendidos-list', 'ficcao popular', 40);
    PreencheLivros('destaques-list', 'livros fantasia best-sellers', 10);
    PreencheLivros('prevendas-list', 'novos lancamentos romance', 10);
    AddLivrosGrid('favoritos-comunidade-grid', 'livros mais vendidos', 10);


    // === FUNÇÕES DO MODAL (Event Listeners) ===
    const infoLivros = document.getElementById('info-livros');
    const closeButton = infoLivros?.querySelector('.btn-fechar');
    const AddFav = document.getElementById('add-fav');
    const RemoveFavBtn = document.getElementById('remove-fav');

    if (closeButton) {
        closeButton.addEventListener('click', FecharModal);
    }

    window.addEventListener('click', (event) => {
        if (event.target === infoLivros) {
            FecharModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && infoLivros?.style.display === 'flex') {
            FecharModal();
        }
    });

    if (AddFav) {
        AddFav.addEventListener('click', () => {
            const book = BuscarLivroNoModal();
            if (book) {
                AddFavoritos(book);
                AtualizaFav();
                FecharModal();
            } else {
                console.warn("Nenhum livro selecionado no modal para adicionar aos favoritos.");
            }
        });
    }

    if (RemoveFavBtn) {
        RemoveFavBtn.addEventListener('click', () => {
            const book = BuscarLivroNoModal();
            if (book && book.id) {
                RemoveFav(book.id);
                AtualizaFav();
                FecharModal();
            } else {
                console.warn("Nenhum livro selecionado no modal para remover dos favoritos ou ID ausente.");
            }
        });
    }

    // === Lógica de Filtros para Promoções (Event Listeners) ===
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', AplicarFiltros); // AplicarFiltros agora faz a requisição
    }
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', LimparFiltros); // LimparFiltros agora faz a requisição inicial
    }



    // --- Funcionalidade de Pesquisa ---
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', async () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                console.log('Pesquisando por:', searchTerm);
                // Popula a lista de destaques com o resultado da pesquisa
                await PreencheLivros('destaques-list', searchTerm, 40);


                const destaquesSection = document.getElementById('highlights-section'); // Seleciona a seção de destaques
                if (destaquesSection) {
                    destaquesSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }

                MostrarSecao('catalog');
            }
        });

        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                searchButton.click();
            }
        });
    }
});
