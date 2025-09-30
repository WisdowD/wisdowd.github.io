// public/functions.js

// === CONFIGURAÇÕES DA API DO GOOGLE LIVROS ===
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes?q=';

// Variáveis globais para Favoritos e Modal
let LivrosFavoritos = [];
let LivroAtual = null;

const infoLivros = document.getElementById('info-livros');
const ImgLivro = document.getElementById('modal-book-image');
const TituloLivro = document.getElementById('titulo-modal');
const AutorLivro = document.getElementById('autor-modal');
const EditoraLivro = document.getElementById('editora-modal');
const DataLivro = document.getElementById('data-livro-modal');
const PagsLivro = document.getElementById('qnt-pag');
const IdiomaLivro = document.getElementById('idioma-livro');
const DescLivro = document.getElementById('desc-livro');
const PreViewLivro = document.getElementById('pre-visualizar-livro');
const ReadBookButton = document.getElementById('read-book-button'); // Obtém o novo botão de ler livro
const ReadBookUnavailableMessage = document.getElementById('read-book-unavailable-message'); // Obtém o span da mensagem
const AddFav = document.getElementById('add-fav');
const RemoveFavBtn = document.getElementById('remove-fav');
const LinkGoogle = document.getElementById('link-google');

export async function ProcurarLivros(query, maxResults = 10) {
    let url = `${BASE_URL}${query}&maxResults=${maxResults}`;
    console.log(`Buscando livros para a query: "${query}" na URL: ${url}`);
    try {
        const response = await fetch(url);
        console.log(`Resposta da API para "${query}": Status ${response.status}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Não foi possível ler os detalhes do erro JSON.' }));
            console.error(`Erro na requisição para a query "${query}": ${response.status} ${response.statusText}`, errorData);
            return [];
        }
        const data = await response.json();
        console.log(`Dados recebidos para "${query}":`, data);
        return data.items || [];
    } catch (error) {
        console.error('Erro geral ao buscar livros (problema de rede, CORS ou outro):', error);
        return [];
    }
}



export function CriaCardLivro(book) {
    const CardLivro = document.createElement('div');
    CardLivro.classList.add('book-card');
    CardLivro.addEventListener('click', () => {
        AbrirModal(book);
    });
    const imageUrl = book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail || 'https://via.placeholder.com/100x150/d3d3d3/808080?text=Sem+Capa';
    const title = book.volumeInfo.title || 'Título Desconhecido';
    const authors = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Autor Desconhecido';
    CardLivro.innerHTML = `
        <img src="${imageUrl}" alt="${title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/100x150/d3d3d3/808080?text=Capa+Indisponível';">
        <div class="book-info">
            <h4>${title}</h4>
            <p>${authors}</p>
        </div>
    `;
    return CardLivro;
}



// === LÓGICA DE FAVORITOS ===
export function CarregaFav() {
    const FavGuardados = localStorage.getItem('LivrosFavoritos');
    if (FavGuardados) {
        try {
            LivrosFavoritos = JSON.parse(FavGuardados);
            console.log('Favoritos carregados do localStorage:', LivrosFavoritos.length);
        } catch (e) {
            console.error("Erro ao carregar favoritos do localStorage:", e);
            LivrosFavoritos = [];
        }
    }
}

export function SalvarFavoritos() {
    localStorage.setItem('LivrosFavoritos', JSON.stringify(LivrosFavoritos));
    console.log('Favoritos salvos no localStorage.');
}
// Função para adicionar um livro aos favoritos
export function AddFavoritos(book) {
    if (!book || !book.id) {
        console.warn("Tentativa de adicionar livro inválido aos favoritos.");
        return;
    }

    // Verifica se o livro já está nos favoritos para evitar duplicatas
    if (!LivrosFavoritos.some(favBook => favBook.id === book.id)) {
        LivrosFavoritos.push(book);
        console.log('Livro adicionado aos favoritos:', book.volumeInfo.title);
        // Atualiza a seção de favoritos
        AtualizaFav();
        alert(`"${book.volumeInfo.title}" foi adicionado aos seus favoritos!`);
    } else {
        console.log('Livro já está nos favoritos:', book.volumeInfo.title);
        alert(`"${book.volumeInfo.title}" já está na sua lista de favoritos.`);
    }
    FecharModal(); // Fecha o modal após adicionar
}

export function RemoveFav(bookId) {
    const initialLength = LivrosFavoritos.length;
    LivrosFavoritos = LivrosFavoritos.filter(favBook => favBook.id !== bookId);
    if (LivrosFavoritos.length < initialLength) {
        SalvarFavoritos();
        console.log('Livro removido dos favoritos. ID:', bookId);
        alert("Livro removido dos favoritos.");
    } else {
        console.warn("Tentativa de remover livro não encontrado nos favoritos. ID:", bookId);
        alert("Este livro não estava na sua lista de favoritos.");
    }
}

export function AtualizaFav() {
    const favoritesGrid = document.getElementById('favoritos-comunidade-grid');
    if (!favoritesGrid) {
        console.warn("Elemento 'favoritos-comunidade-grid' não encontrado.");
        return;
    }

    favoritesGrid.innerHTML = ''; // Limpa a seção de favoritos

    if (LivrosFavoritos.length === 0) {
        favoritesGrid.innerHTML = '<p style="margin: 20px; text-align: center;">Seus livros favoritos aparecerão aqui. Adicione alguns!</p>';
    } else {
        LivrosFavoritos.forEach(book => {
            const CardLivro = CriaCardLivro(book); // Reutiliza a função de criar card
            favoritesGrid.appendChild(CardLivro);
        });
    }
    console.log('Seção de favoritos atualizada. Total de favoritos:', LivrosFavoritos.length);
}
export function BuscarFavoritos() {
    return LivrosFavoritos;
}

// Modal (Conteudo Quando o Livro for clicado)
export function LivroNoModal(book) {
    LivroAtual = book;
}
export function BuscarLivroNoModal() {
    return LivroAtual;
}
export function AbrirModal(book) {
    LivroNoModal(book);
    if (!infoLivros || !ImgLivro || !TituloLivro || !AddFav || !RemoveFavBtn) {
        console.error("Elementos do modal não encontrados. Verifique seu HTML e a ordem de carregamento.");
        return;
    }

    const volumeInfo = book.volumeInfo;
    const accessInfo = book.accessInfo;

    const imageUrl = volumeInfo.imageLinks?.extraLarge || volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.medium || volumeInfo.imageLinks?.small || volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || 'https://via.placeholder.com/200x300/d3d3d3/808080?text=Capa+Indisponível';

    ImgLivro.src = imageUrl;
    ImgLivro.alt = volumeInfo.title || 'Capa do Livro';

    TituloLivro.textContent = volumeInfo.title || 'Título Desconhecido';
    AutorLivro.textContent = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor Desconhecido';
    EditoraLivro.textContent = `Editora: ${volumeInfo.publisher || 'Desconhecida'}`;
    DataLivro.textContent = `Data de Publicação: ${volumeInfo.publishedDate || 'Desconhecida'}`;
    PagsLivro.textContent = `Páginas: ${volumeInfo.pageCount || 'Desconhecidas'}`;
    IdiomaLivro.textContent = `Idioma: ${volumeInfo.language ? volumeInfo.language.toUpperCase() : 'Desconhecido'}`;
    DescLivro.innerHTML = volumeInfo.description || 'Nenhuma descrição disponível.';

    if (volumeInfo.previewLink) {
        PreViewLivro.href = volumeInfo.previewLink;
        PreViewLivro.style.display = 'inline-block';
    } else {
        PreViewLivro.style.display = 'none';
    }

    if (accessInfo && accessInfo.webReaderLink) {
        ReadBookButton.href = accessInfo.webReaderLink;
        ReadBookButton.style.display = 'inline-block';
        ReadBookButton.classList.remove('disabled-button');
        ReadBookUnavailableMessage.style.display = 'none';
    } else {
        ReadBookButton.href = '#';
        ReadBookButton.style.display = 'inline-block';
        ReadBookButton.classList.add('disabled-button');
        ReadBookUnavailableMessage.style.display = 'inline-block';
    }

    if (book.volumeInfo.infoLink) {
        LinkGoogle.href = book.volumeInfo.infoLink;
        LinkGoogle.style.display = 'inline-block';
    } else {
        LinkGoogle.href = '#';
        LinkGoogle.style.display = 'none';
    }

    const isFavorite = LivrosFavoritos.some(favBook => favBook.id === book.id);

    if (isFavorite) {
        AddFav.style.display = 'none';
        RemoveFavBtn.style.display = 'inline-block';
    } else {
        AddFav.style.display = 'inline-block';
        RemoveFavBtn.style.display = 'none';
    }

    // ✅ ADIÇÃO FEITA AQUI: MOSTRAR PRÉVIA COM IFRAME
    const previewDiv = document.getElementById('google-preview');
    if (previewDiv && book.id) {
        previewDiv.innerHTML = `<iframe 
            src="https://books.google.com/books?id=${book.id}&printsec=frontcover&output=embed" 
            width="100%" 
            height="600" 
            frameborder="0" 
            allowfullscreen></iframe>`;
    }

    infoLivros.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

export function FecharModal() {
    if (infoLivros) {
        infoLivros.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
}

// Preencher as Divs Vazias do index
export async function PreencheLivros(elementId, query, maxResults = 20) {
    const listContainer = document.getElementById(elementId);
    if (!listContainer) {
        console.warn(`Elemento com ID '${elementId}' não encontrado. Verifique o HTML.`);
        return;
    }

    const SetaEsquerda = listContainer.querySelector('.left-arrow');
    const SetaDireita = listContainer.querySelector('.right-arrow');
    const CardAtual = listContainer.querySelectorAll('.book-card');
    CardAtual.forEach(card => card.remove());

    const existingMessage = listContainer.querySelector('.no-books-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const books = await ProcurarLivros(query, maxResults);
    console.log(`Livros retornados para "${query}":`, books.length);

    if (books.length === 0) {
        const msg = document.createElement('p');
        msg.classList.add('no-books-message');
        msg.style.margin = '20px';
        msg.style.textAlign = 'center';
        msg.style.flexGrow = '1';
        msg.textContent = 'Nenhum livro encontrado para esta categoria.';
        if (SetaDireita) {
            listContainer.insertBefore(msg, SetaDireita);
        } else {
            listContainer.appendChild(msg);
        }
        return;
    }

    books.forEach(book => {
        if (book && book.volumeInfo) {
            const CardLivro = CriaCardLivro(book);
            if (SetaDireita) {
                listContainer.insertBefore(CardLivro, SetaDireita);
            } else {
                listContainer.appendChild(CardLivro);
            }
        } else {
            console.warn('Livro inválido encontrado:', book);
        }
    });

    if (SetaEsquerda && SetaDireita) {
        const NovaSetaEsquerda = SetaEsquerda.cloneNode(true);
        const NovaSetaDireita = SetaDireita.cloneNode(true);
        SetaEsquerda.parentNode.replaceChild(NovaSetaEsquerda, SetaEsquerda);
        SetaDireita.parentNode.replaceChild(NovaSetaDireita, SetaDireita);

        NovaSetaEsquerda.addEventListener('click', () => {
            listContainer.scrollBy({
                left: -listContainer.clientWidth * 0.8,
                behavior: 'smooth'
            });
        });
        NovaSetaDireita.addEventListener('click', () => {
            listContainer.scrollBy({
                left: listContainer.clientWidth * 0.8,
                behavior: 'smooth'
            });
        });
    }
}
export async function AddLivrosGrid(elementId, query, maxResults = 28) {
    const gridContainer = document.getElementById(elementId);
    if (!gridContainer) {
        console.warn(`Elemento com ID '${elementId}' não encontrado. Verifique o HTML.`);
        return;
    }
    gridContainer.innerHTML = '';

    const books = await ProcurarLivros(query, maxResults);
    console.log(`Livros retornados para grid "${query}":`, books.length);

    if (books.length === 0) {
        gridContainer.innerHTML = '<p class="no-books-message" style="margin: 20px; text-align: center;">Nenhum livro encontrado para esta categoria.</p>';
        return;
    }

    books.forEach(book => {
        if (book && book.volumeInfo) {
            const CardLivro = CriaCardLivro(book);
            gridContainer.appendChild(CardLivro);
        } else {
            console.warn('Livro inválido encontrado para grid:', book);
        }
    });
}


let ConsultaInitPromo = 'promoções ou livros baratos'; // Query padrão para promoções
let MaxResultadoPromo = 28; // Resultados padrão para promoções

// Promoções
export async function BuscarEMostrarLivroPromo(query = ConsultaInitPromo, maxResults = MaxResultadoPromo) {
    const books = await ProcurarLivros(query, maxResults);
    PreencherLivroPromocoes(books); // Popula com os livros da requisição
}

export function PreencherLivroPromocoes(LivrosParaMostrar) {
    const PromoGrid = document.getElementById('promocoes-grid');
    if (!PromoGrid) {
        console.warn("Elemento 'promocoes-grid' não encontrado.");
        return;
    }
    PromoGrid.innerHTML = '';

    if (LivrosParaMostrar.length === 0) {
        PromoGrid.innerHTML = '<p style="margin: 20px; text-align: center;">Nenhum livro encontrado com os filtros selecionados.</p>';
        return;
    }

    LivrosParaMostrar.forEach(book => {
        const CardLivro = CriaCardLivro(book);
        PromoGrid.appendChild(CardLivro);
    });
    console.log(`Promoções grid atualizado. Total: ${LivrosParaMostrar.length}`);
}




// Filtros
export async function AplicarFiltros() {
    const CategoriasSelecionadas = Array.from(document.querySelectorAll('.filter-group input[data-filter-type="category"]:checked')).map(cb => cb.value.toLowerCase());
    const IdiomasSelecionados = Array.from(document.querySelectorAll('.filter-group input[data-filter-type="language"]:checked')).map(cb => cb.value.toLowerCase());

    let queryString = 'livro'; // Começa com uma query base

    if (CategoriasSelecionadas.length > 0) {
        // Concatena as categorias selecionadas para a query
        queryString += ' ' + CategoriasSelecionadas.join(' OR ');
    }



    let langQueryPart = '';
    if (IdiomasSelecionados.length > 0) {
        langQueryPart = ` inlanguage:${IdiomasSelecionados.join(',')}`; // Ex: inlanguage:pt,en
    }

    const ConsultaFinal = (queryString + langQueryPart).trim();

    // Se nenhum filtro for selecionado, use a query inicial de promoções
    const ConsultaParaUsar = (CategoriasSelecionadas.length === 0 && IdiomasSelecionados.length === 0) ? ConsultaInitPromo : ConsultaFinal;

    console.log(`Aplicando filtros. Nova query para API: "${ConsultaParaUsar}"`);
    const LivrosFiltrados = await ProcurarLivros(ConsultaParaUsar, MaxResultadoPromo);
    PreencherLivroPromocoes(LivrosFiltrados);
}

export async function LimparFiltros() {
    const FiltroCheck = document.querySelectorAll('.filter-sidebar input[type="checkbox"]');
    FiltroCheck.forEach(checkbox => {
        checkbox.checked = false;
    });
    await BuscarEMostrarLivroPromo(ConsultaInitPromo, MaxResultadoPromo);
}




// Funções de Gerenciamento de Seções
const navLinks = document.querySelectorAll('.main-nav .nav-link');
const SecoesConteudo = document.querySelectorAll('main.container > section.section');

export function MostrarSecao(targetId) {
    navLinks.forEach(link => link.classList.remove('active'));
    const clickedLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
    if (clickedLink) {
        clickedLink.classList.add('active');
    }

    SecoesConteudo.forEach(section => section.classList.add('hidden'));

    if (targetId === 'catalog') {
        document.getElementById('catalog-section')?.classList.remove('hidden');
        document.getElementById('highlights-section')?.classList.remove('hidden');
        document.getElementById('preorders-section')?.classList.remove('hidden');
        document.getElementById('mais-vendidos-section')?.classList.remove('hidden');
    } else if (targetId === 'favorites') {
        document.getElementById('favorites-section')?.classList.remove('hidden');
        AtualizaFav();
    } else if (targetId === 'promotions') {
        document.getElementById('promotions-section')?.classList.remove('hidden');
        // Ao abrir a seção de promoções, garanta que os filtros estejam limpos e faça uma nova requisição inicial
        LimparFiltros(); // Isso chamará BuscarEMostrarLivroPromo
    }
    console.log(`Exibindo seção: ${targetId}`);
}





