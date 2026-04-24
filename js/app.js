const supabaseUrl = 'https://xargjfqxfcinhyssxfal.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhcmdqZnF4ZmNpbmh5c3N4ZmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDU4MzEsImV4cCI6MjA4ODgyMTgzMX0.0wD-i-iy3tkBCfObwgvXvDZJwCHBTu7GziAN6NOf3O0';
let supabaseClient = null;
function getSupabase() {
    if (supabaseClient) return supabaseClient;
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        return supabaseClient;
    }
    return null;
}

let products = JSON.parse(localStorage.getItem('calith_products_fallback')) || [
    { id: 1, name: "Kapı Barfiks Barı", category: "bar", price: 349, oldPrice: 449, image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=800&auto=format&fit=crop", desc: "Kolay kurulum, 130kg taşıma kapasitesi. Köpük tutamaçlar.", badge: "ÇOK SATAN" },
    { id: 2, name: "Duvar Barfiks Pro", category: "bar", price: 899, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop", desc: "Çoklu tutuş pozisyonu. Çelik konstrüksiyon.", badge: "PRO" },
    { id: 3, name: "Ahşap Paralel Bar", category: "parallettes", price: 599, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop", desc: "Kayın ağacı, el yapımı. Kaymaz taban.", badge: "YENİ" },
    { id: 4, name: "Jimnastik Halkası", category: "rings", price: 449, image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=800&auto=format&fit=crop", desc: "ABS veya ahşap. Ayarlanabilir kayış.", badge: null },
    { id: 5, name: "Direnç Bandı Seti", category: "band", price: 249, image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=800&auto=format&fit=crop", desc: "5 farklı direnç. Pull-up assist.", badge: "SET" },
    { id: 6, name: "Sokak Workout Seti", category: "bundle", price: 1499, oldPrice: 1799, image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop", desc: "Barfiks + Paralel + Halka + Band.", badge: "İNDİRİM" }
];

async function loadProducts() {
    const sb = getSupabase();

    // Kodun içindeki örnek ürünler
    const defaultProducts = [
        { id: 'def1', name: "Kapı Barfiks Barı", category: "bar", price: 349, old_price: 449, image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=800&auto=format&fit=crop", desc: "Kolay kurulum, 130kg taşıma kapasitesi. Köpük tutamaçlar.", badge: "ÇOK SATAN" },
        { id: 'def2', name: "Duvar Barfiks Pro", category: "bar", price: 899, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop", desc: "Çoklu tutuş pozisyonu. Çelik konstrüksiyon.", badge: "PRO" },
        { id: 'def3', name: "Ahşap Paralel Bar", category: "parallettes", price: 599, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop", desc: "Kayın ağacı, el yapımı. Kaymaz taban.", badge: "YENİ" },
        { id: 'def4', name: "Jimnastik Halkası", category: "rings", price: 449, image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=800&auto=format&fit=crop", desc: "ABS veya ahşap. Ayarlanabilir kayış.", badge: null },
        { id: 'def5', name: "Direnç Bandı Seti", category: "band", price: 249, image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=800&auto=format&fit=crop", desc: "5 farklı direnç. Pull-up assist.", badge: "SET" },
        { id: 'def6', name: "Sokak Workout Seti", category: "bundle", price: 1499, old_price: 1799, image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop", desc: "Barfiks + Paralel + Halka + Band.", badge: "İNDİRİM" }
    ];

    if (!sb) {
        products = defaultProducts;
        renderShop();
        return;
    }

    const { data, error } = await sb.from('products').select('*').order('id', { ascending: false });

    if (error) {
        console.error('Supabase error:', error);
        products = defaultProducts;
    } else {
        const deletedProducts = JSON.parse(localStorage.getItem('calith_deleted_products')) || [];
        const dbProducts = data || [];
        const combined = [...dbProducts];

        defaultProducts.forEach(def => {
            const exists = dbProducts.some(db => db.name === def.name);
            const isManuallyDeleted = deletedProducts.includes(def.name);
            if (!exists && !isManuallyDeleted) combined.push(def);
        });

        // TÜM listeyi süzgeçten geçir (DB'den silinse de silinmese de gizle)
        products = combined.filter(p => !deletedProducts.includes(p.name));
        localStorage.setItem('calith_products_fallback', JSON.stringify(products));
    }

    renderShop();
    renderAdminProducts();
}

async function importDefaults() {
    const sb = getSupabase();
    if (!sb) return alert('Supabase hazır değil.');
    if (!confirm('Örnek ürünleri veritabanına aktarmak istediğinize emin misiniz?')) return;

    // ID'siz gönderiyoruz ki veritabanı otomatik atasın ve çakışma olmasın
    const defaults = [
        { name: "Kapı Barfiks Barı", category: "bar", price: 349, old_price: 449, image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=800&auto=format&fit=crop", desc: "Kolay kurulum, 130kg taşıma kapasitesi. Köpük tutamaçlar.", badge: "ÇOK SATAN" },
        { name: "Duvar Barfiks Pro", category: "bar", price: 899, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop", desc: "Çoklu tutuş pozisyonu. Çelik konstrüksiyon.", badge: "PRO" },
        { name: "Ahşap Paralel Bar", category: "parallettes", price: 599, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop", desc: "Kayın ağacı, el yapımı. Kaymaz taban.", badge: "YENİ" },
        { name: "Jimnastik Halkası", category: "rings", price: 449, image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=800&auto=format&fit=crop", desc: "ABS veya ahşap. Ayarlanabilir kayış.", badge: null },
        { name: "Direnç Bandı Seti", category: "band", price: 249, image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=800&auto=format&fit=crop", desc: "5 farklı direnç. Pull-up assist.", badge: "SET" },
        { name: "Sokak Workout Seti", category: "bundle", price: 1499, old_price: 1799, image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop", desc: "Barfiks + Paralel + Halka + Band.", badge: "İNDİRİM" }
    ];

    const { error } = await sb.from('products').insert(defaults);
    if (error) {
        console.error('Import error:', error);
        alert('Aktarım hatası: ' + error.message);
    } else {
        showToast('Varsayılan ürünler başarıyla aktarıldı');
        loadProducts(); // Listeyi yenile
    }
}

const defaultPosts = [];

let posts = [];
let blogPosts = [];
let programPosts = [];

async function loadPosts() {
    const sb = getSupabase();
    const deletedPostTitles = JSON.parse(localStorage.getItem('calith_deleted_posts')) || [];

    let allData = [];
    if (!sb) {
        allData = defaultPosts.filter(def => !deletedPostTitles.includes(def.title));
    } else {
        const { data, error } = await sb.from('posts').select('*').order('id', { ascending: false });
        if (!error && data) {
            allData = data.map(p => ({
                ...p,
                category: p.category || 'temel',
                image: p.image || 'https://a.pinatafarm.com/295x340/0406bd5408/borat.jpg',
                excerpt: p.excerpt || (p.title ? p.title.substring(0, 50) + '...' : ''),
                date: (p.created_at || p.date || '').slice(0, 10)
            }));
        }
    }

    posts = allData;
    programPosts = allData.filter(p => p.category.startsWith('program_'));
    blogPosts = allData.filter(p => !p.category.startsWith('program_'));

    renderLandingBlog();
    if (typeof renderBlog === 'function') renderBlog();
    if (typeof renderAdminPosts === 'function') renderAdminPosts();
    if (typeof renderAdminPrograms === 'function') renderAdminPrograms();

    // URL parametrelerine göre detay sayfalarını aç
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('b');      // blog.html?b=ID
    const programId = urlParams.get('p');   // skills.html?p=ID
    const levelParam = urlParams.get('level'); // skills.html?level=baslangic

    if (blogId && typeof showBlogDetail === 'function') {
        showBlogDetail(blogId);
    } else if (programId && typeof showProgramDetail === 'function') {
        showProgramDetail(programId);
    } else if (levelParam && typeof showProgramLevel === 'function') {
        showProgramLevel(levelParam, levelParam.charAt(0).toUpperCase() + levelParam.slice(1));
    }
}
let cart = JSON.parse(localStorage.getItem('calith_cart')) || [];
let currentPd = null;
let currentBlogId = null;
let pdQty = 1;
let isAdminMode = false;

// --- WORKOUT STATE ---
let workoutSession = {
    active: false,
    program: null,
    dayIndex: 0,
    startTime: null,
    exercises: [], // [{name: '', target: '', sets: []}]
    currExerciseIdx: 0,
    currSet: 1,
    history: [] // [{name: '', sets: [{weight: 0, reps: 0}]}]
};
let workoutInterval = null;
let restInterval = null;

function showSection(section) {
    const target = document.getElementById(section);

    // Farklı sayfaya yönlendirme gerekiyorsa (Zaten o sayfada değilsek)
    const path = window.location.pathname.toLowerCase();
    const isBlogPage = path.includes('blog');
    const isShopPage = path.includes('shop');
    const isAdminPage = path.includes('admin');

    if (!target) {
        // Hedef element bu sayfada yoksa ve başka bir sayfaya aitse yönlendir
        if (section === 'shop' && !isShopPage) return window.location.href = 'shop.html';
        if (section === 'blog' && !isBlogPage) return window.location.href = 'blog.html';
        if (section === 'admin' && !isAdminPage) return window.location.href = 'admin.html';
        if (section === 'profile' && !path.includes('index.html')) return window.location.href = 'index.html?section=profile';
        if (section === 'landing' && !path.includes('index.html') && path !== '/') return window.location.href = 'index.html';

        if (section === 'product-detail' && currentPd && !isShopPage) return window.location.href = `shop.html?p=${currentPd.id}`;
        if (section === 'blog-detail' && currentBlogId && !isBlogPage) return window.location.href = `blog.html?b=${currentBlogId}`;

        console.warn(`Section "${section}" bu sayfada bulunamadı.`);
        return;
    }

    document.querySelectorAll('section').forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('active');
    });
    target.classList.remove('hidden');
    setTimeout(() => target.classList.add('active'), 50);

    const nav = document.getElementById('global-nav');
    document.body.classList.add('theme-dark');
    document.body.classList.remove('theme-light');

    if (nav) {
        nav.classList.remove('bg-white/80', 'border-gray-200');
    }
    window.scrollTo(0, 0);
    if (section === 'landing') renderLandingBlog();
    if (section === 'shop') renderShop();
    if (section === 'blog') renderBlog();
}

function renderLandingBlog() {
    const container = document.getElementById('landing-blog-preview');
    if (!container) return;
    container.innerHTML = blogPosts.slice(0, 3).map(p => `
        <article onclick="window.location.href='blog.html?b=${p.id}'" class="product-card group cursor-pointer rounded-3xl overflow-hidden card-hover">
            <div class="aspect-video relative overflow-hidden">
                <img src="${p.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-calith-dark via-transparent to-transparent"></div>
            </div>
            <div class="p-6">
                <div class="flex items-center gap-2 mb-3">
                    <span class="px-3 py-1 bg-calith-orange/20 text-calith-orange text-[10px] font-bold uppercase tracking-wider rounded-full">${p.category}</span>
                    <span class="text-gray-500 text-[10px] uppercase font-bold tracking-widest">${p.date}</span>
                </div>
                <h3 class="font-display text-xl font-bold mb-3 group-hover:text-calith-orange transition-colors">${p.title}</h3>
                <p class="text-gray-400 text-sm line-clamp-2 md:h-10 mb-4">${p.excerpt}</p>
                <div class="flex items-center gap-2 text-sm font-bold text-calith-orange opacity-0 group-hover:opacity-100 transition-all">
                    OKU <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </div>
            </div>
        </article>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

function renderShop(filter = 'all') {
    const grid = document.getElementById('shop-grid');
    if (!grid) return;

    // Filtre butonlarını göster (Çünkü mağaza listesini görüntülüyoruz)
    const filters = document.getElementById('shop-filters');
    if (filters) filters.classList.remove('hidden');

    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
    grid.innerHTML = filtered.map(p => `
        <div onclick="showProductDetail('${p.id}')" class="product-card group cursor-pointer rounded-3xl overflow-hidden card-hover">
            <div class="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-8 relative overflow-hidden">
                <img src="${p.image}" class="w-full h-full object-cover mix-blend-overlay opacity-50 group-hover:opacity-100 transition-opacity">
                ${p.badge ? `<span class="absolute top-4 left-4 bg-calith-orange text-white text-[10px] font-bold px-3 py-1 rounded-full">${p.badge}</span>` : ''}
                ${p.oldPrice ? `<span class="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">-%${Math.round((1 - p.price / p.oldPrice) * 100)}</span>` : ''}
            </div>
            <div class="p-6">
                <p class="text-[10px] text-calith-orange font-bold uppercase tracking-widest mb-1">${p.category}</p>
                <h3 class="font-display text-lg font-bold mb-3 group-hover:text-white transition-colors">${p.name}</h3>
                <div class="flex items-center justify-between">
                    <div class="flex items-baseline gap-2">
                        <span class="font-bold text-xl">${p.price}₺</span>
                        ${p.oldPrice ? `<span class="text-xs text-gray-500 line-through">${p.oldPrice}₺</span>` : ''}
                    </div>
                    <button onclick="event.stopPropagation(); addToCart('${p.id}')" class="w-10 h-10 bg-calith-orange/10 text-calith-orange rounded-full flex items-center justify-center hover:bg-calith-orange hover:text-white transition-all transform hover:rotate-90">
                        <i data-lucide="plus" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

function addToCartById(id) {
    const p = products.find(item => item.id === id);
    if (p) addToCart(p, 1);
}

function filterProducts(cat) {
    document.querySelectorAll('.shop-filter').forEach(b => { b.classList.remove('active', 'bg-black', 'text-white'); if (b.dataset.filter === cat) b.classList.add('active', 'bg-black', 'text-white'); });
    renderShop(cat);
}

function showProductDetail(id) {
    currentPd = products.find(p => String(p.id) === String(id));
    if (!currentPd) return;

    // Ürün detayındayken filtre butonlarını gizle
    const filters = document.getElementById('shop-filters');
    if (filters) filters.classList.add('hidden');

    const imgEl = document.getElementById('pd-image');
    if (imgEl) imgEl.src = currentPd.image;

    document.getElementById('pd-category').textContent = currentPd.category;
    document.getElementById('pd-name').textContent = currentPd.name;
    document.getElementById('pd-price').textContent = currentPd.price + '₺';
    document.getElementById('pd-old-price').textContent = currentPd.oldPrice ? currentPd.oldPrice + '₺' : '';
    document.getElementById('pd-desc').textContent = currentPd.desc;
    pdQty = 1; document.getElementById('pd-qty').textContent = '1';
    showSection('product-detail');
}

function changePdQty(delta) { pdQty = Math.max(1, pdQty + delta); document.getElementById('pd-qty').textContent = pdQty; }

function addToCartFromDetail() { if (!currentPd) return; addToCart(currentPd.id, pdQty); }

function renderBlog(filter = 'all') {
    const list = document.getElementById('blog-list');
    if (!list) return;

    const filtered = filter === 'all' ? blogPosts : blogPosts.filter(p => p.category === filter);

    if (filtered.length === 0) {
        list.innerHTML = '<div class="col-span-3 text-center py-20 text-gray-500 font-bold uppercase tracking-widest">Henüz yazı yok.</div>';
        return;
    }

    list.innerHTML = filtered.map((p, i) => `
        <article onclick="window.location.href='blog.html?b=${p.id}'" class="product-card group cursor-pointer rounded-3xl overflow-hidden card-hover fade-in stagger-${(i % 3) + 1}">
            <div class="aspect-video relative overflow-hidden">
                <img src="${p.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-calith-dark via-transparent to-transparent opacity-60"></div>
            </div>
            <div class="p-6">
                <div class="flex items-center gap-2 mb-3">
                    <span class="px-3 py-1 bg-calith-orange/20 text-calith-orange text-[10px] font-bold uppercase tracking-wider rounded-full">${p.category}</span>
                    <span class="text-gray-500 text-[10px] uppercase font-bold tracking-widest">${p.date}</span>
                </div>
                <h3 class="font-display text-2xl font-bold mb-3 group-hover:text-calith-orange transition-colors">${p.title}</h3>
                <p class="text-gray-400 text-sm line-clamp-2 mb-6">${p.excerpt}</p>
                <div class="flex items-center gap-2 text-sm font-bold text-calith-orange opacity-0 group-hover:opacity-100 transition-all">
                    OKU <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </div>
            </div>
        </article>
    `).join('');
    if (window.lucide) lucide.createIcons();
    initScrollReveal();
}

function filterBlog(cat) {
    document.querySelectorAll('.blog-filter').forEach(b => {
        b.classList.remove('active', 'bg-white', 'text-black');
        if (b.dataset.filter === cat) b.classList.add('active', 'bg-white', 'text-black');
    });
    renderBlog(cat);
}

let blogRetryCount = 0;
function showBlogDetail(id) {
    currentBlogId = id;
    if (!posts || posts.length === 0) {
        if (blogRetryCount < 10) {
            blogRetryCount++;
            setTimeout(() => showBlogDetail(id), 200);
        } else {
            console.error('Blog yazıları yüklenemedi, zaman aşımı.');
        }
        return;
    }
    blogRetryCount = 0; // Başarılıysa sıfırla
    const p = posts.find(post => String(post.id) === String(id));
    if (!p) return;

    // blog.html'deki gerçek ID: post-content
    const contentDiv = document.getElementById('post-content');
    const isBlogPage = window.location.pathname.toLowerCase().includes('blog');

    if (!contentDiv && !isBlogPage) {
        window.location.href = `blog.html?b=${id}`;
        return;
    }

    if (!contentDiv) return;

    let displayContent = p.content || '';
    let videoMatch = displayContent.match(/<!-- VIDEO: (.*?) -->/);
    let videoUrl = videoMatch ? videoMatch[1] : '';
    displayContent = displayContent.replace(/<!-- VIDEO: (.*?) -->/g, '');
    // Supabase'den gelen şişirilmiş HTML'i temizle (eski kayıtlar için de geçerli)
    if (typeof sanitizeContent === 'function') displayContent = sanitizeContent(displayContent);

    let mediaHtml = '';
    if (videoUrl) {
        let embedUrl = videoUrl;

        // Eğer kullanıcı direkt embed (iframe) kodu yapıştırdıysa içindeki src'yi çekelim
        const iframeMatch = videoUrl.match(/src=["'](.*?)["']/);
        if (iframeMatch) {
            embedUrl = iframeMatch[1];
        }

        if (embedUrl.includes('youtube.com/watch?v=')) {
            embedUrl = embedUrl.replace('watch?v=', 'embed/').split('&')[0];
        } else if (embedUrl.includes('youtu.be/')) {
            embedUrl = embedUrl.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0];
        }
        mediaHtml = `<div class="w-full aspect-video rounded-2xl mb-12 overflow-hidden shadow-2xl border border-white/10">
            <iframe src="${embedUrl}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
        </div>`;
    } else if (p.image) {
        mediaHtml = `<img src="${p.image}" class="w-full aspect-video object-cover rounded-2xl mb-12 grayscale hover:grayscale-0 transition-all duration-700">`;
    }

    contentDiv.innerHTML = `
        <div class="mb-8">
            <span class="inline-block px-4 py-1 bg-white/10 rounded-full text-sm font-medium uppercase tracking-wider mb-4">${p.category}</span>
            <h1 class="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">${p.title}</h1>
            <div class="flex items-center gap-4 text-secondary text-sm">
                <span><i class="far fa-calendar mr-2"></i>${p.date}</span>
                <span><i class="far fa-clock mr-2"></i>5 dk okuma</span>
            </div>
        </div>
        ${mediaHtml}
        <div class="prose prose-invert prose-lg max-w-none">
            ${displayContent}
        </div>
        <div class="mt-12 pt-8 border-t border-primary">
            <h3 class="text-2xl font-bold mb-4">İlgini Çekebilir</h3>
            <div class="grid md:grid-cols-2 gap-4">
                ${posts.filter(post => post.id.toString() !== p.id.toString() && ((p.category.startsWith('program_') && post.category.startsWith('program_')) || (!p.category.startsWith('program_') && !post.category.startsWith('program_')))).slice(0, 2).map(post => `
                    <div onclick="showBlogDetail('${post.id}')" class="cursor-pointer bg-secondary border border-primary p-4 rounded-xl hover:border-white/30 transition-colors">
                        <h4 class="font-bold mb-1">${post.title}</h4>
                        <p class="text-sm text-secondary">${post.excerpt.substring(0, 60)}...</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    showSection('blog-detail');
}

function showAdmin() {
    const adminSection = document.getElementById('admin');
    if (!adminSection) {
        window.location.href = 'admin.html';
        return;
    }
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    adminSection.classList.remove('hidden');
    adminSection.classList.add('active');
    document.getElementById('admin-login').classList.remove('hidden');
    document.getElementById('admin-editor').classList.add('hidden');
    window.scrollTo(0, 0);
}

async function checkAdmin() {
    const emailInput = document.getElementById('admin-email');
    const passInput = document.getElementById('admin-pass');

    if (!emailInput || !passInput) return;

    const email = emailInput.value.trim();
    const pass = passInput.value.trim();
    const sb = getSupabase();

    if (!sb) {
        alert("Veritabanı bağlantısı yok. Giriş yapılamıyor.");
        return;
    }

    // Supabase Authentication
    const { data, error } = await sb.auth.signInWithPassword({
        email: email,
        password: pass
    });

    if (error) {
        alert('Giriş başarısız: ' + error.message);
    } else {
        // YENİ: Kullanıcı admin rolüne sahip mi kontrol et
        if (data.user?.user_metadata?.role !== 'admin') {
            alert('Bu panele girmek için yönetici (admin) yetkiniz bulunmamaktadır!');
            await sb.auth.signOut();
            return;
        }

        const loginEl = document.getElementById('admin-login');
        const editorEl = document.getElementById('admin-editor');
        if (loginEl) loginEl.classList.add('hidden');
        if (editorEl) editorEl.classList.remove('hidden');

        isAdminMode = true;
        showToast('Yönetici girişi başarılı');

        if (typeof switchAdminTab === 'function') switchAdminTab('blog');
        if (window.lucide) lucide.createIcons();
    }
}

async function logoutAdmin() {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();

    const loginEl = document.getElementById('admin-login');
    const editorEl = document.getElementById('admin-editor');
    if (loginEl) loginEl.classList.remove('hidden');
    if (editorEl) editorEl.classList.add('hidden');

    const passInput = document.getElementById('admin-pass');
    const emailInput = document.getElementById('admin-email');
    if (passInput) passInput.value = '';
    if (emailInput) emailInput.value = '';

    isAdminMode = false;
    updateCartUI();
}

function insertFormat(type) {
    document.getElementById('editor').focus();
    const html = type === 'bold' ? '<b>Kalın metin</b>' : type === 'h2' ? '<h2>Başlık</h2>' : '<ul><li>Madde 1</li><li>Madde 2</li></ul>';
    document.execCommand('insertHTML', false, html);
}

function insertImage() { const url = prompt('Görsel URL:'); if (url) document.execCommand('insertHTML', false, `<img src="${url}" style="max-width:100%;margin:1rem 0;border-radius:0.5rem;">`); }

function insertVideo() {
    const url = prompt('YouTube URL:');
    const id = url.match(/(?:youtu\.be\/|v\/|watch\?v=)([^&?]+)/)?.[1];
    if (id) document.execCommand('insertHTML', false, `<iframe src="https://www.youtube.com/embed/${id}" style="width:100%;aspect-ratio:16/9;border-radius:0.5rem;"></iframe>`);
}

async function saveProduct() {
    const sb = getSupabase();
    if (!sb) return alert('Supabase bağlantısı yok.');

    const productData = {
        name: document.getElementById('prod-name').value,
        category: document.getElementById('prod-category').value,
        price: parseFloat(document.getElementById('prod-price').value),
        old_price: parseFloat(document.getElementById('prod-old-price').value) || null,
        image: document.getElementById('prod-image-url').value,
        desc: document.getElementById('prod-desc').value,
        badge: document.getElementById('prod-badge').value || null
    };

    if (!productData.name || !productData.price) return alert('İsim ve fiyat zorunludur.');

    const editId = document.getElementById('prod-edit-id').value;

    let result;
    // Eğer editId 'def' ile başlıyorsa bu bir örnek üründür ve veritabanında yoktur.
    // Bu yüzden 'update' yerine 'insert' yapmalıyız.
    if (editId && !editId.startsWith('def')) {
        result = await sb.from('products').update(productData).eq('id', editId);
    } else {
        result = await sb.from('products').insert([productData]);
    }

    if (result.error) {
        console.error('Save error:', result.error);
        alert('Hata: ' + result.error.message);
    } else {
        showToast((editId && !editId.startsWith('def')) ? 'Ürün güncellendi' : 'Ürün veritabanına kaydedildi');
        resetProductForm();
        loadProducts();
    }
}

async function deleteProduct(id) {
    const productToDelete = products.find(p => String(p.id) === String(id));
    if (!productToDelete) return;
    if (!confirm(`"${productToDelete.name}" ürününü silmek istediğinize emin misiniz?`)) return;

    const sb = getSupabase();
    let deletedFromDb = false;

    if (sb && !String(id).startsWith('def')) {
        const { data, error } = await sb.from('products').delete().eq('id', id).select();

        if (error) {
            console.error('Supabase Delete Error:', error);
            alert(`VERİTABANI SİLME HATASI: ${error.message}\n\nNot: Supabase Dashboard -> Policies kısmından DELETE izni vermeniz gerekebilir.`);
        } else if (data && data.length > 0) {
            deletedFromDb = true;
        }
    }

    // Kara listeye ekle (Özellikle örnek veriler veya DB'den silinemeyenler için)
    const deletedProducts = JSON.parse(localStorage.getItem('calith_deleted_products')) || [];
    if (!deletedProducts.includes(productToDelete.name)) {
        deletedProducts.push(productToDelete.name);
        localStorage.setItem('calith_deleted_products', JSON.stringify(deletedProducts));
    }

    products = products.filter(p => String(p.id) !== String(id));

    showToast(deletedFromDb ? 'Ürün veritabanından silindi' : 'Ürün yerel listeden kaldırıldı');
    loadProducts();
}

function editProduct(id) {
    console.log('Editing product ID:', id);
    const p = products.find(item => String(item.id) === String(id));
    if (!p) {
        console.error('Edit failed: Product not found for ID:', id);
        return;
    }

    document.getElementById('prod-edit-id').value = p.id;
    document.getElementById('prod-name').value = p.name || '';
    document.getElementById('prod-category').value = p.category || 'bar';
    document.getElementById('prod-price').value = p.price || '';
    document.getElementById('prod-old-price').value = p.old_price || p.oldPrice || '';
    document.getElementById('prod-image-url').value = p.image || '';
    document.getElementById('prod-desc').value = p.desc || '';
    document.getElementById('prod-badge').value = p.badge || '';

    // Switch to product tab if not active
    if (typeof switchAdminTab === 'function') switchAdminTab('products');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Ürün bilgileri yüklendi');
}

function resetProductForm() {
    document.getElementById('prod-edit-id').value = '';
    document.getElementById('prod-name').value = '';
    document.getElementById('prod-price').value = '';
    document.getElementById('prod-old-price').value = '';
    document.getElementById('prod-image-url').value = '';
    document.getElementById('prod-desc').value = '';
    document.getElementById('prod-badge').value = '';
}

function renderAdminProducts() {
    const list = document.getElementById('admin-product-list');
    if (!list) return;

    if (!products || products.length === 0) {
        list.innerHTML = '<div class="col-span-full py-12 text-center text-gray-500">Ürün bulunamadı.</div>';
        return;
    }

    list.innerHTML = products.map(p => `
        <div class="bg-calith-dark/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-calith-orange/30 transition-all">
            <div class="flex items-center gap-4">
                <img src="${p.image}" class="w-12 h-12 rounded-lg object-cover">
                <div>
                    <h4 class="font-bold text-sm">${p.name}</h4>
                    <p class="text-xs text-gray-500">${p.price} TL ${p.category ? `• ${p.category}` : ''}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="editProduct('${p.id}')" class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-calith-orange rounded-xl transition-all group/btn" title="Düzenle">
                    <i data-lucide="edit-2" class="w-4 h-4 pointer-events-none"></i>
                </button>
                <button onclick="deleteProduct('${p.id}')" class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-red-500 rounded-xl transition-all group/btn" title="Sil">
                    <i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i>
                </button>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

/**
 * Yapıştırılan içerikten inline style, Tailwind class ve gereksiz attribute’ları temizler.
 * Sadece temel HTML yapısını korur.
 */
function sanitizeContent(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;

    // Yalnızca izin verilen etiketler (daha geniş bir beyaz liste)
    const ALLOWED_TAGS = new Set(['p','h1','h2','h3','h4','h5','h6','ul','ol','li',
        'b','strong','i','em','u','s','a','img','br','hr','blockquote',
        'table','thead','tbody','tr','th','td','span','div','iframe']);

    function cleanNode(node) {
        // Metin nodları olduğu gibi kalıyor
        if (node.nodeType === Node.TEXT_NODE) return;

        if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();

            // İzin verilmeyen etiketleri içerikleriyle birlikte kaldır
            if (!ALLOWED_TAGS.has(tag)) {
                // İçindeki metin önemli olabilir, parent'a taş
                const parent = node.parentNode;
                while (node.firstChild) parent.insertBefore(node.firstChild, node);
                parent.removeChild(node);
                return;
            }

            // style ve class gibi zararlı attribute’ları temizle
            // (href, src, alt, width, height, frameborder, allowfullscreen izinli)
            const ALLOWED_ATTRS = new Set(['href','src','alt','width','height',
                'frameborder','allowfullscreen','target','rel']);
            Array.from(node.attributes).forEach(attr => {
                if (!ALLOWED_ATTRS.has(attr.name.toLowerCase())) {
                    node.removeAttribute(attr.name);
                }
            });
        }

        // Çocuk nodları temizle (ters sırada çünkü nodlar değişiyor)
        Array.from(node.childNodes).forEach(child => cleanNode(child));
    }

    Array.from(tmp.childNodes).forEach(child => cleanNode(child));
    return tmp.innerHTML;
}

async function savePost() {
    const title = document.getElementById('post-title').value;
    let content = sanitizeContent(document.getElementById('editor').innerHTML);
    const category = document.getElementById('post-category').value;
    const image = document.getElementById('post-cover').value;
    const video = document.getElementById('post-video').value;
    const editId = document.getElementById('post-edit-id').value;

    if (!title) { alert('Başlık gerekli!'); return; }

    // Video URL'sini içeriğin sonuna gizli bir etiket olarak ekliyoruz
    content = content.replace(/<!-- VIDEO: (.*?) -->/g, ''); // Varsa temizle
    if (video && video.trim() !== '') {
        content += `<!-- VIDEO: ${video.trim()} -->`;
    }

    const postData = {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        excerpt: title.substring(0, 50) + '...',
        content,
        image: image || null,
        published: true
    };

    const sb = getSupabase();
    if (!sb) { alert('Hata: Supabase bağlantısı kurulamadı.'); return; }

    let result;
    if (editId) {
        result = await sb.from('posts').update(postData).eq('id', editId);
    } else {
        result = await sb.from('posts').insert([postData]);
    }

    if (result.error) {
        alert('Hata: ' + result.error.message);
        return;
    }

    await loadPosts();
    showToast(editId ? 'Yazı güncellendi' : 'Yazı yayınlandı');
    resetPostForm();
}

function renderAdminPosts() {
    const list = document.getElementById('admin-post-list');
    if (!list) return;

    if (!blogPosts || blogPosts.length === 0) {
        list.innerHTML = '<div class="py-12 text-center text-gray-500">Yazı bulunamadı.</div>';
        return;
    }

    list.innerHTML = blogPosts.map(p => `
        <div class="bg-calith-dark/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-calith-orange/30 transition-all">
            <div class="flex-1">
                <h4 class="font-bold text-sm line-clamb-1">${p.title}</h4>
                <p class="text-[10px] text-gray-500 uppercase tracking-widest">${p.category} • ${p.date || ''}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="editPost('${p.id}')" class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-calith-orange rounded-xl transition-all group/btn">
                    <i data-lucide="edit-2" class="w-4 h-4 pointer-events-none"></i>
                </button>
                <button onclick="deletePost('${p.id}')" class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-red-500 rounded-xl transition-all group/btn">
                    <i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i>
                </button>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function editPost(id) {
    const p = posts.find(post => String(post.id) === String(id));
    if (!p) return;

    let displayContent = p.content || '';
    let videoMatch = displayContent.match(/<!-- VIDEO: (.*?) -->/);
    let videoUrl = videoMatch ? videoMatch[1] : '';
    displayContent = displayContent.replace(/<!-- VIDEO: (.*?) -->/g, '');

    document.getElementById('post-edit-id').value = p.id;
    document.getElementById('post-title').value = p.title;
    document.getElementById('post-category').value = p.category;
    document.getElementById('post-cover').value = p.image || '';
    document.getElementById('post-video').value = videoUrl;
    document.getElementById('editor').innerHTML = displayContent;
    document.getElementById('btn-save-post').textContent = 'YAZIYI GÜNCELLE';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Yazı düzenleme moduna alındı');
}

async function deletePost(id) {
    const postToDelete = posts.find(p => String(p.id) === String(id));
    if (!postToDelete) return;
    if (!confirm(`"${postToDelete.title}" yazısını silmek istediğinizden emin misiniz?`)) return;

    const sb = getSupabase();
    let deletedFromDb = false;

    if (sb && isNaN(id)) { // Veritabanı ID'leri UUID formatındadır (harf/tire içerir), taslak yazılar ise numaradır (1, 2, 3).
        const { data, error } = await sb.from('posts').delete().eq('id', id).select();

        if (error) {
            console.error('Supabase Delete Error:', error);
            alert(`VERİTABANI SİLME HATASI: ${error.message}\n\nNot: Supabase Dashboard -> "posts" tablosu -> RLS Policies kısmından DELETE izni vermeniz gerekir. Veya eklenmiş UUID formatı gereklidir.`);
        } else if (data && data.length > 0) {
            deletedFromDb = true;
        }
    }

    // Kara listeye ekle (Veritabanında olmasa bile (örnek veriler) ekranı temiz tutmak için)
    const deletedPostTitles = JSON.parse(localStorage.getItem('calith_deleted_posts')) || [];
    if (!deletedPostTitles.includes(postToDelete.title)) {
        deletedPostTitles.push(postToDelete.title);
        localStorage.setItem('calith_deleted_posts', JSON.stringify(deletedPostTitles));
    }

    // Listeyi baştan güncelleyerek blogPosts ve programPosts alt dizelerini de düzeltelim.
    await loadPosts();

    showToast(deletedFromDb ? 'Yazı veritabanından silindi' : 'Yazı listelerden kaldırıldı');
}

function resetPostForm() {
    document.getElementById('post-edit-id').value = '';
    document.getElementById('post-title').value = '';
    document.getElementById('post-cover').value = '';
    document.getElementById('editor').innerHTML = '';
    document.getElementById('btn-save-post').textContent = 'YAZIYI YAYINLA';
}

function previewPost() {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><script src="https://cdn.tailwindcss.com"><\/script></head><body class="bg-black text-white p-8 max-w-3xl mx-auto">${document.getElementById('editor').innerHTML}</body></html>`);
}

function addToCart(id, qty = 1) {
    const p = products.find(item => String(item.id) === String(id));
    if (!p) return;

    const existing = cart.find(i => String(i.id) === String(id));
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ ...p, qty });
    }

    saveCart();
    updateCartUI();
    showToast(`${p.name} sepete eklendi`);

    const drawer = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
        drawer.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
    }
}

function saveCart() { localStorage.setItem('calith_cart', JSON.stringify(cart)); }

function updateCartUI() {
    const count = cart.reduce((s, i) => s + i.qty, 0), total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
    const badge = document.getElementById('cart-badge'), mobileBadge = document.getElementById('mobile-cart-badge');
    if (badge) { badge.textContent = count; badge.classList.toggle('hidden', count === 0); }
    if (mobileBadge) { mobileBadge.textContent = count; mobileBadge.classList.toggle('hidden', count === 0); }
    const drawerCount = document.getElementById('cart-count-drawer'), subtotal = document.getElementById('cart-subtotal'), totalEl = document.getElementById('cart-total'), shipping = document.getElementById('cart-shipping');
    if (drawerCount) drawerCount.textContent = `(${count})`;
    if (subtotal) subtotal.textContent = total + '₺';
    if (totalEl) totalEl.textContent = total + '₺';
    if (shipping) {
        if (total >= 500) { shipping.textContent = 'Bedava'; shipping.className = 'font-medium text-green-600'; }
        else { shipping.textContent = '49₺'; shipping.className = 'font-medium'; }
    }
    const container = document.getElementById('cart-items');
    if (container) {
        if (cart.length === 0) {
            container.innerHTML = '<div class="text-center py-12 text-gray-500"><i data-lucide="shopping-cart" class="w-12 h-12 mx-auto mb-4 opacity-10"></i><p class="font-medium">Sepetin boş</p></div>';
        } else {
            container.innerHTML = cart.map(item => `
                <div class="flex gap-4 p-4 rounded-2xl bg-calith-dark border border-white/5 mb-3">
                    <div class="w-20 h-20 bg-gray-800 rounded-xl overflow-hidden">
                        <img src="${item.image}" class="w-full h-full object-cover opacity-80">
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-sm mb-1 line-clamp-1">${item.name}</h4>
                        <p class="text-calith-orange font-bold text-sm mb-3">${item.price}₺</p>
                        <div class="flex items-center gap-3">
                            <div class="flex items-center border border-white/10 rounded-lg overflow-hidden h-8">
                                <button onclick="updateCartQty(${item.id}, -1)" class="px-3 hover:bg-white/5 transition-colors text-gray-400">-</button>
                                <span class="px-2 text-xs font-bold min-w-[1.5rem] text-center">${item.qty}</span>
                                <button onclick="updateCartQty(${item.id}, 1)" class="px-3 hover:bg-white/5 transition-colors text-gray-400">+</button>
                            </div>
                            <button onclick="removeFromCart(${item.id})" class="text-red-500/50 hover:text-red-500 transition-colors">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                    <div class="font-display font-bold text-lg">${item.price * item.qty}₺</div>
                </div>
            `).join('');
        }
    }
    if (window.lucide) lucide.createIcons();
}

function updateCartQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty = Math.max(1, item.qty + delta);
        saveCart();
        updateCartUI();
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
}

function toggleCart() {
    const drawer = document.getElementById('cart-sidebar'), overlay = document.getElementById('cart-overlay');
    if (!drawer || !overlay) return;
    if (drawer.classList.contains('translate-x-full')) {
        drawer.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        drawer.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    }
}

function checkout() {
    if (cart.length === 0) return;
    const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
    alert(`Ödeme: ${total}₺\n\nDemo versiyon.`);
}

function showToast(msg) {
    const toast = document.getElementById('toast'), msgEl = document.getElementById('toast-msg');
    if (toast && msgEl) {
        msgEl.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
}

// Mobil menü dışına tıklayınca kapatma
document.addEventListener('click', (e) => {
    const menu = document.getElementById('mobile-menu');
    const menuBtn = document.querySelector('button[onclick="toggleMobileMenu()"]');
    
    if (menu && !menu.classList.contains('hidden')) {
        // Eğer tıklanan yer menü değilse VE menü butonu (veya içindeki herhangi bir şey) değilse
        if (!menu.contains(e.target) && (!menuBtn || !menuBtn.contains(e.target))) {
            menu.classList.add('hidden');
        }
    }
});

function init() {
    loadPosts();
    loadProducts(); // Dinamik ürünleri yükle
    updateCartUI();
    loadLinks();
    loadAnnouncements();

    // Supabase Auto-Session Check
    const sb = getSupabase();
    if (sb) {
        sb.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                const role = session.user?.user_metadata?.role || 'user';
                isAdminMode = (role === 'admin');
            } else {
                isAdminMode = false;
            }

            const editor = document.getElementById('admin-editor');
            const login = document.getElementById('admin-login');
            const loading = document.getElementById('admin-loading');

            if (loading) loading.classList.add('hidden');

            if (editor && login) {
                if (isAdminMode) {
                    editor.classList.remove('hidden');
                    login.classList.add('hidden');
                } else {
                    editor.classList.add('hidden');
                    login.classList.remove('hidden');
                }
            }
        });
        updateHappyMembersStats();
    }

    // Scroll reveal observe
    initScrollReveal();

    // Lucide support
    if (window.lucide) lucide.createIcons();

    // URL parametre kontrolü loadPosts() içinde posts yüklendikten sonra yapılıyor
    // (blog.html?b=ID ve skills.html?p=ID ve skills.html?level=... için)
}

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal, .fade-in').forEach(el => observer.observe(el));
}

// ============================================
// PROGRAM YÖNETİMİ FONKSİYONLARI (ADMIN)
// ============================================
async function saveProgram() {
    const title = document.getElementById('prog-title').value;
    const category = document.getElementById('prog-category').value;
    const image = document.getElementById('prog-cover').value;
    const video = document.getElementById('prog-video').value;
    const editId = document.getElementById('prog-edit-id').value;

    if (!title) return alert('Başlık gerekli!');

    // 5 Günlük veriyi topla
    const days = [];
    for (let i = 1; i <= 5; i++) {
        const dayName = document.getElementById(`prog-day-${i}-name`).value.trim();
        const dayBadge = document.getElementById(`prog-day-${i}-badge`).value.trim();
        
        // Dinamik satırlardan egzersizleri topla
        const exerciseList = document.getElementById(`prog-day-${i}-exercises-list`);
        const exercises = [];
        
        if (exerciseList) {
            const rows = exerciseList.querySelectorAll('.exercise-row');
            rows.forEach(row => {
                const name = row.querySelector('.ex-name').value.trim();
                const sets = row.querySelector('.ex-sets').value.trim();
                const reps = row.querySelector('.ex-reps').value.trim();
                const type = row.querySelector('.ex-type').value;
                
                if (name) {
                    exercises.push({ name, sets, reps, type });
                }
            });
        }
        
        days.push({ name: dayName, badge: dayBadge, exercises: exercises });
    }

    const notes = document.getElementById('prog-notes').value.trim();
    const mediaSize = document.getElementById('prog-media-size').value;

    const programData = { days, notes, mediaSize };
    let content = JSON.stringify(programData);
    if (video && video.trim() !== '') {
        content += `<!-- VIDEO: ${video.trim()} -->`;
    }

    const postData = {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        excerpt: title.substring(0, 50) + '...',
        content,
        image: image || null,
        published: true
    };

    const sb = getSupabase();
    if (!sb) return alert('Hata: Supabase bağlantısı kurulamadı.');

    let result;
    if (editId) {
        result = await sb.from('posts').update(postData).eq('id', editId);
    } else {
        result = await sb.from('posts').insert([postData]);
    }

    if (result.error) return alert('Hata: ' + result.error.message);

    await loadPosts();
    showToast(editId ? 'Program güncellendi' : 'Program eklendi');
    resetProgramForm();
}

function addExerciseRow(dayNum, data = null) {
    const list = document.getElementById(`prog-day-${dayNum}-exercises-list`);
    if (!list) return;

    const rowId = Date.now() + Math.random();
    const row = document.createElement('div');
    row.className = 'exercise-row flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5 group transition-all hover:border-calith-orange/30';
    row.id = `row-${rowId}`;
    
    row.innerHTML = `
        <input type="text" placeholder="Hareket Adı" class="ex-name flex-1 bg-transparent border-none p-0 text-[11px] font-bold outline-none focus:ring-0 text-white placeholder-gray-700" value="${data ? data.name : ''}">
        <div class="flex items-center gap-1 shrink-0 border-l border-white/10 pl-2">
            <input type="text" placeholder="S" title="Set" class="ex-sets w-8 bg-transparent border-none p-0 text-[11px] text-center font-mono font-bold text-calith-orange outline-none focus:ring-0" value="${data ? data.sets : ''}">
            <span class="text-gray-700 text-[10px]">×</span>
            <input type="text" placeholder="R" title="Tekrar/Sn" class="ex-reps w-12 bg-transparent border-none p-0 text-[11px] text-center font-mono font-bold text-white outline-none focus:ring-0" value="${data ? data.reps : ''}">
            <select title="Tür" class="ex-type bg-transparent border-none p-0 text-[9px] font-black uppercase text-gray-500 outline-none focus:ring-0 cursor-pointer">
                <option value="reps" ${data && data.type === 'reps' ? 'selected' : ''}>TKR</option>
                <option value="secs" ${data && data.type === 'secs' ? 'selected' : ''}>SN</option>
            </select>
            <button type="button" onclick="this.closest('.exercise-row').remove()" class="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors">
                <i data-lucide="x" class="w-3 h-3"></i>
            </button>
        </div>
    `;
    
    list.appendChild(row);
    if (window.lucide) lucide.createIcons();
}

function renderAdminPrograms() {
    const list = document.getElementById('admin-prog-list');
    if (!list) return;

    if (!programPosts || programPosts.length === 0) {
        list.innerHTML = '<div class="py-12 text-center text-gray-500">Program bulunamadı.</div>';
        return;
    }

    list.innerHTML = programPosts.map(p => `
        <div class="bg-calith-dark/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-calith-orange/30 transition-all">
            <div class="flex-1">
                <h4 class="font-bold text-sm line-clamb-1">${p.title}</h4>
                <p class="text-[10px] text-gray-500 uppercase tracking-widest">${p.category.replace('program_', '')}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="editProgram('${p.id}')" class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-calith-orange rounded-xl transition-all group/btn">
                    <i data-lucide="edit-2" class="w-4 h-4 pointer-events-none"></i>
                </button>
                <button onclick="deleteProgram('${p.id}')" class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-red-500 rounded-xl transition-all group/btn">
                    <i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i>
                </button>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function editProgram(id) {
    const p = programPosts.find(post => String(post.id) === String(id));
    if (!p) return;

    resetProgramForm();

    let displayContent = p.content || '';
    let videoMatch = displayContent.match(/<!-- VIDEO: (.*?) -->/);
    let videoUrl = videoMatch ? videoMatch[1] : '';
    displayContent = displayContent.replace(/<!-- VIDEO: (.*?) -->/g, '');

    document.getElementById('prog-edit-id').value = p.id;
    document.getElementById('prog-title').value = p.title;
    document.getElementById('prog-category').value = p.category;
    document.getElementById('prog-cover').value = p.image || '';
    document.getElementById('prog-video').value = videoUrl;

    try {
        const data = JSON.parse(displayContent);
        const days = Array.isArray(data) ? data : (data.days || []);
        
        days.forEach((day, index) => {
            const i = index + 1;
            if (i > 5) return;
            document.getElementById(`prog-day-${i}-name`).value = day.name || '';
            document.getElementById(`prog-day-${i}-badge`).value = day.badge || '';
            
            // Egzersizleri ekle
            if (day.exercises && Array.isArray(day.exercises)) {
                day.exercises.forEach(ex => {
                    if (typeof ex === 'object') {
                        addExerciseRow(i, ex);
                    } else {
                        // Eski format (String) ise parse etmeye çalış
                        const parts = ex.split('(');
                        const name = parts[0].trim();
                        let target = parts[1] ? parts[1].replace(')', '').trim() : '';
                        let sets = '-', reps = '-';
                        if (target.includes('x')) {
                            sets = target.split('x')[0].trim();
                            reps = target.split('x')[1].trim();
                        } else {
                            reps = target;
                        }
                        addExerciseRow(i, { name, sets, reps, type: 'reps' });
                    }
                });
            }
        });

        if (data.notes) document.getElementById('prog-notes').value = data.notes;
        if (data.mediaSize) document.getElementById('prog-media-size').value = data.mediaSize;
    } catch (e) {
        console.error('Program parse error:', e);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Program düzenleniyor');
}

async function deleteProgram(id) {
    const progToDelete = programPosts.find(p => String(p.id) === String(id));
    if (!progToDelete) return;
    if (!confirm(`"\${progToDelete.title}" programını silmek istediğinizden emin misiniz?`)) return;

    const sb = getSupabase();
    let deletedFromDb = false;

    if (sb && isNaN(id)) {
        const { data, error } = await sb.from('posts').delete().eq('id', id).select();
        if (error) console.error(error);
        else if (data && data.length > 0) deletedFromDb = true;
    }

    const deletedPostTitles = JSON.parse(localStorage.getItem('calith_deleted_posts')) || [];
    if (!deletedPostTitles.includes(progToDelete.title)) {
        deletedPostTitles.push(progToDelete.title);
        localStorage.setItem('calith_deleted_posts', JSON.stringify(deletedPostTitles));
    }

    await loadPosts();
    showToast(deletedFromDb ? 'Veritabanından silindi' : 'Listeden kaldırıldı');
}

function resetProgramForm() {
    document.getElementById('prog-edit-id').value = '';
    document.getElementById('prog-title').value = '';
    document.getElementById('prog-cover').value = '';
    document.getElementById('prog-video').value = '';
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`prog-day-${i}-name`).value = '';
        document.getElementById(`prog-day-${i}-badge`).value = '';
        const list = document.getElementById(`prog-day-${i}-exercises-list`);
        if (list) list.innerHTML = '';
    }
    document.getElementById('prog-notes').value = '';
    document.getElementById('prog-media-size').value = 'medium';
}

// PROGRAM GÖSTERİM FONKSİYONLARI (SKILLS.HTML)
// ============================================
function backToProgramList(skipHistory = false) {
    if (!skipHistory) {
        // URL'den p parametresini temizle, level kalsın
        const url = new URL(window.location.href);
        url.searchParams.delete('p');
        window.history.pushState({ path: url.href }, '', url.href);
    }

    const listSec = document.getElementById('program-list-view');
    const detailSec = document.getElementById('blog-detail');
    if (detailSec) detailSec.classList.add('hidden');
    if (listSec) listSec.classList.remove('hidden');
}

function backToLevels(skipHistory = false) {
    if (!skipHistory) {
        // URL'den level parametresini temizle
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }

    const mainSec = document.getElementById('programs');
    const listSec = document.getElementById('program-list-view');
    const detailSec = document.getElementById('blog-detail');

    if (mainSec) mainSec.classList.remove('hidden');
    if (listSec) listSec.classList.add('hidden');
    if (detailSec) detailSec.classList.add('hidden');
}

function toggleDayAccordion(index) {
    const indices = [];
    
    // Kullanıcı Gruplandırması:
    // Üst Grup: Gün 1, 2, 3 (index 0, 1, 2)
    // Alt Grup: Gün 4, 5 (index 3, 4)
    if (index <= 2) {
        indices.push(0, 1, 2);
    } else {
        indices.push(3, 4);
    }
    
    if (indices.length === 0) return;

    // Grubun durumunu kontrol etmek için sayfada var olan ilk elemanı baz alalım
    let firstExistingIdx = indices.find(idx => document.getElementById(`day-content-${idx}`));
    if (firstExistingIdx === undefined) return;

    const firstContent = document.getElementById(`day-content-${firstExistingIdx}`);
    const shouldExpand = !firstContent.classList.contains('expanded');
    
    indices.forEach(idx => {
        const content = document.getElementById(`day-content-${idx}`);
        const card = document.getElementById(`day-card-${idx}`);
        if (content && card) {
            if (shouldExpand) {
                content.classList.add('expanded');
                card.classList.add('expanded-parent');
            } else {
                content.classList.remove('expanded');
                card.classList.remove('expanded-parent');
            }
        }
    });
}

function showProgramLevel(level, titleStr, skipHistory = false) {
    if (!skipHistory) {
        // Browser URL'ini güncelle (Paylaşılabilir link için)
        const url = new URL(window.location.href);
        url.searchParams.set('level', level);
        url.searchParams.delete('p'); // Level değişince detay parametresini temizle
        window.history.pushState({ path: url.href }, '', url.href);
    }

    const mainSec = document.getElementById('programs');
    const listSec = document.getElementById('program-list-view');
    const detailSec = document.getElementById('blog-detail');

    if (mainSec) mainSec.classList.add('hidden');
    if (detailSec) detailSec.classList.add('hidden');
    if (listSec) listSec.classList.remove('hidden');

    const titleEl = document.getElementById('program-list-title');
    if (titleEl) titleEl.innerHTML = titleStr + ' <span class="gradient-text">PROGRAMLARI</span>';

    const grid = document.getElementById('dynamic-programs-grid');
    if (!grid) return;

    // Grid yerine flex-col kullanarak daha ferah bir liste yapalım
    grid.className = "flex flex-col gap-5 max-w-4xl mx-auto";

    const levelPrograms = programPosts.filter(p => p.category === 'program_' + level);

    if (levelPrograms.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-400">Bu seviyede henüz program bulunmuyor.</div>';
        return;
    }

    grid.innerHTML = levelPrograms.map((p, i) => `
        <div onclick="showProgramDetail('${p.id}')" class="group cursor-pointer relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-calith-orange/30 rounded-[2rem] p-4 sm:p-6 transition-all duration-500 flex flex-col lg:flex-row items-center gap-6 overflow-hidden reveal active">
            <!-- Arka Plan Büyük Numara (Dekoratif) -->
            <div class="absolute -left-4 -bottom-4 text-[8rem] font-black text-white/[0.02] pointer-events-none group-hover:text-calith-orange/[0.03] transition-colors duration-700 select-none">0${i+1}</div>
            
            <!-- Program Görseli (Küçük ve Şık) -->
            <div class="w-full lg:w-40 aspect-video lg:aspect-square rounded-2xl overflow-hidden shrink-0 border border-white/10 group-hover:border-calith-orange/30 transition-all duration-500 shadow-2xl">
                <img src="${p.image}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110">
            </div>

            <!-- İçerik Alanı -->
            <div class="flex-1 text-center lg:text-left relative z-10">
                <div class="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-3">
                    <span class="text-[9px] font-black text-calith-orange uppercase tracking-[0.2em] bg-calith-orange/10 px-3 py-1 rounded-full border border-calith-orange/20">PROGRAM 0${i+1}</span>
                    <span class="text-[9px] font-bold text-gray-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">${p.category.replace('program_', '').toUpperCase()} SEVİYE</span>
                </div>
                
                <h3 class="font-display text-2xl sm:text-3xl font-bold mb-3 tracking-tight group-hover:text-white transition-colors uppercase leading-tight">${p.title}</h3>
                <p class="text-gray-400 text-xs leading-relaxed max-w-2xl line-clamp-2 mb-5 group-hover:text-gray-300 transition-colors">${p.excerpt}</p>
                
                <!-- Özellikler -->
                <div class="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-gray-500">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                            <i data-lucide="clock" class="w-3.5 h-3.5 text-calith-orange"></i>
                        </div>
                        <span class="text-[9px] font-black uppercase tracking-widest">Haftalık 5 Gün</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                            <i data-lucide="zap" class="w-3.5 h-3.5 text-calith-orange"></i>
                        </div>
                        <span class="text-[9px] font-black uppercase tracking-widest">Yoğun Antrenman</span>
                    </div>
                </div>
            </div>

            <!-- Aksiyon Butonu -->
            <div class="shrink-0 relative z-10">
                <div class="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-calith-orange group-hover:border-calith-orange transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(255,107,0,0.3)]">
                    <i data-lucide="arrow-right" class="w-5 h-5 text-white group-hover:scale-110 transition-transform"></i>
                </div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
    window.scrollTo(0, 0);
}

function showProgramDetail(id, skipHistory = false) {
    if (!skipHistory) {
        const url = new URL(window.location.href);
        url.searchParams.set('p', id);
        window.history.pushState({ path: url.href }, '', url.href);
    }

    const mainSec = document.getElementById('programs');
    const listSec = document.getElementById('program-list-view');
    const detailSec = document.getElementById('blog-detail');

    if (!detailSec) {
        // Eğer bu sayfada detay alanı yoksa (örneğin profile.html), skills.html'e yönlendir
        window.location.href = `skills.html?p=${id}`;
        return;
    }

    if (mainSec) mainSec.classList.add('hidden');
    if (listSec) listSec.classList.add('hidden');
    detailSec.classList.remove('hidden');

    // Hem genel posts hem de kullanıcının özel programları (myPrograms) içinde ara
    let p = posts.find(post => String(post.id) === String(id));
    
    // Eğer posts içinde bulamazsa myPrograms içinde ara
    if (!p && typeof myPrograms !== 'undefined') {
        p = myPrograms.find(prog => String(prog.id) === String(id));
    }

    if (!p) {
        showToast('Program verisi yüklenemedi. Lütfen sayfayı yenileyin.');
        console.error('Program not found in posts or myPrograms:', id);
        return;
    }

    const contentDiv = document.getElementById('post-content');
    if (!contentDiv) return;

    let displayContent = p.content || '';
    let videoMatch = displayContent.match(/<!-- VIDEO: (.*?) -->/);
    let videoUrl = videoMatch ? videoMatch[1] : '';
    displayContent = displayContent.replace(/<!-- VIDEO: (.*?) -->/g, '');

    let mediaHtml = '';
    if (videoUrl) {
        let embedUrl = videoUrl;
        const iframeMatch = videoUrl.match(/src=["'](.*?)["']/);
        if (iframeMatch) embedUrl = iframeMatch[1];
        if (embedUrl.includes('watch?v=')) embedUrl = embedUrl.replace('watch?v=', 'embed/').split('&')[0];
        else if (embedUrl.includes('youtu.be/')) embedUrl = embedUrl.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0];

        mediaHtml = `<div class="w-full aspect-video rounded-3xl mb-12 overflow-hidden shadow-2xl border border-white/10 group relative">
            <iframe src="${embedUrl}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
        </div>`;
    } else if (p.image) {
        mediaHtml = `<div class="w-full aspect-video rounded-3xl mb-12 overflow-hidden border border-white/5 shadow-2xl">
            <img src="${p.image}" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700">
        </div>`;
    }

    let programHtml = '';
    let notesHtml = '';
    let mediaWidthClass = 'max-w-none';

    try {
        const data = JSON.parse(displayContent);
        const days = Array.isArray(data) ? data : (data.days || []);
        const notes = data.notes || '';
        const mediaSize = data.mediaSize || 'large';

        if (mediaSize === 'small') mediaWidthClass = 'max-w-sm mx-auto';
        else if (mediaSize === 'medium') mediaWidthClass = 'max-w-2xl mx-auto';

        if (Array.isArray(days)) {
            const group1 = days.slice(0, 3);
            const group2 = days.slice(3, 5);

            const renderCard = (day, i) => {
                if (!day.name && (!day.exercises || day.exercises.length === 0)) return '';

                const exList = day.exercises || [];
                const isRestDay = exList.length === 0 || 
                                  (exList.length === 1 && (
                                    String(exList[0].name || exList[0]).toUpperCase().includes('REST') ||
                                    String(exList[0].name || exList[0]).toUpperCase().includes('DİNLEN') ||
                                    String(exList[0].name || exList[0]).toUpperCase().includes('DINLEN')
                                  ));

                let dayContentHtml = '';

                if (isRestDay) {
                    dayContentHtml = `
                        <div class="py-10 flex flex-col items-center justify-center text-center">
                            <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                                <i data-lucide="moon" class="w-8 h-8 text-gray-500"></i>
                            </div>
                            <h5 class="text-sm font-black text-white uppercase tracking-widest mb-2">DİNLENME GÜNÜ</h5>
                            <p class="text-xs text-gray-500 font-bold max-w-[200px]">Kaslarının toparlanması için bugün kendine vakit ayır.</p>
                        </div>
                    `;
                } else {
                    const exercisesHtml = exList.map(ex => {
                        let name, sets, reps, type;

                        if (typeof ex === 'object') {
                            name = ex.name;
                            sets = ex.sets;
                            reps = ex.reps;
                            type = ex.type || 'reps';
                        } else {
                            const parts = String(ex).split('(');
                            name = parts[0].trim();
                            let target = parts[1] ? parts[1].replace(')', '').trim() : '-';
                            if (target.includes('x')) {
                                sets = target.split('x')[0].trim();
                                reps = target.split('x')[1].trim();
                            } else {
                                sets = '-';
                                reps = target;
                            }
                            type = 'reps';
                        }

                        return `
                        <div class="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl group/item hover:bg-white/[0.06] hover:border-calith-orange/20 transition-all">
                            <div class="flex items-center gap-3 pr-2">
                                <div class="w-1.5 h-1.5 rounded-full bg-calith-orange group-hover/item:scale-125 transition-transform shrink-0"></div>
                                <span class="text-[13px] font-bold text-gray-200 uppercase tracking-tight leading-tight">${name}</span>
                            </div>
                            <div class="flex items-center gap-2 shrink-0">
                                <div class="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 w-[70px] justify-center">
                                    <span class="text-xs font-mono font-bold text-calith-orange">${sets}</span>
                                    <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">SET</span>
                                </div>
                                <div class="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 w-[85px] justify-center">
                                    <span class="text-xs font-mono font-bold text-white">${reps}</span>
                                    <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">${type === 'secs' ? 'SN' : 'TEKRAR'}</span>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('');

                    dayContentHtml = `
                        <div class="space-y-3">
                            ${exercisesHtml}
                        </div>
                        <button onclick="startWorkoutMode('${p.id}', ${i})" class="mt-6 w-full py-4 bg-calith-orange/10 border border-calith-orange/20 rounded-2xl flex items-center justify-center gap-3 text-calith-orange text-[10px] font-black uppercase tracking-[0.2em] hover:bg-calith-orange hover:text-black transition-all group/btn">
                            <i data-lucide="play" class="w-4 h-4 group-hover/btn:scale-110 transition-transform"></i> BU GÜNÜ BAŞLAT
                        </button>
                    `;
                }

                return `
                <div class="program-day-card expanded-parent bg-calith-gray/40 border border-white/5 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-calith-orange/5 transition-all group reveal active" id="day-card-${i}">
                    <div class="p-6 cursor-pointer flex items-center justify-between select-none" onclick="toggleDayAccordion(${i})">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-2xl day-number-badge flex items-center justify-center border border-calith-orange/10">
                                <span class="text-sm font-black text-calith-orange">0${i+1}</span>
                            </div>
                            <div>
                                <h4 class="font-display text-lg font-bold tracking-tight text-white group-hover:text-calith-orange transition-colors">${day.name || 'GÜN ' + (i+1)}</h4>
                                <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">${day.badge || 'ANTRENMAN'}</p>
                            </div>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center chevron-icon">
                            <i data-lucide="chevron-down" class="w-4 h-4 text-gray-400"></i>
                        </div>
                    </div>
                    <div class="accordion-content expanded" id="day-content-${i}">
                        <div class="accordion-inner px-6 pb-6">
                            <div class="h-px bg-gradient-to-r from-white/10 to-transparent mb-6"></div>
                            ${dayContentHtml}
                        </div>
                    </div>
                </div>`;
            };

            programHtml = `
                <div class="mb-12">
                    <div class="flex items-center gap-3 mb-6">
                        <span class="w-1.5 h-6 bg-calith-orange rounded-full"></span>
                        <h4 class="text-sm font-black text-white/50 uppercase tracking-[0.2em]">ANA RUTİN (GÜN 1-2-3)</h4>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${group1.map((day, i) => renderCard(day, i)).join('')}</div>
                </div>
                ${group2.length > 0 ? `
                <div class="mb-12">
                    <div class="flex items-center gap-3 mb-6">
                        <span class="w-1.5 h-6 bg-calith-accent rounded-full"></span>
                        <h4 class="text-sm font-black text-white/50 uppercase tracking-[0.2em]">TAMAMLAYICI & TOPARLANMA (GÜN 4-5)</h4>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${group2.map((day, i) => renderCard(day, i + 3)).join('')}</div>
                </div>` : ''}`;
        }

        if (notes) {
            notesHtml = `<div class="mt-12 p-8 rounded-3xl bg-gradient-to-br from-calith-orange/5 to-transparent border border-calith-orange/10 reveal active">
                <div class="flex items-center gap-3 mb-4">
                    <i data-lucide="info" class="w-5 h-5 text-calith-orange"></i>
                    <h4 class="text-sm font-black text-white uppercase tracking-widest">Antrenman Notları</h4>
                </div>
                <p class="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">${notes}</p>
            </div>`;
        }
    } catch (e) {
        programHtml = `<div class="prose prose-invert prose-lg max-w-none">${sanitizeContent(displayContent)}</div>`;
    }

    contentDiv.innerHTML = `
        <div class="mb-12">
            <h1 class="text-4xl md:text-7xl font-black tracking-tighter mb-4 leading-none uppercase">${p.title}</h1>
            <div class="flex items-center gap-3">
                <span class="px-3 py-1 bg-calith-orange text-black text-[10px] font-black uppercase tracking-widest rounded-lg">CALITH PROGRAM</span>
                <span class="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">${p.category.replace('program_', '')} SEVİYE</span>
            </div>
        </div>
        <div class="${mediaWidthClass}">${mediaHtml}</div>
        <div class="mt-8">
            <div class="flex items-center gap-4 mb-8">
                <div class="h-px flex-1 bg-gradient-to-r from-calith-orange/50 to-transparent"></div>
                <h3 class="text-xs font-black text-calith-orange uppercase tracking-[0.3em]">Haftalık Rutin</h3>
                <div class="h-px flex-1 bg-gradient-to-l from-calith-orange/50 to-transparent"></div>
            </div>
            ${programHtml}
            ${notesHtml}
            <div class="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 reveal active">
                <button onclick="startWorkoutMode('${p.id}')" class="w-full sm:w-auto bg-white text-black px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transform hover:scale-[1.05] transition-all shadow-2xl shadow-white/10 active:scale-95">
                    <i data-lucide="play" class="w-5 h-5"></i>
                    <span>1. GÜNDEN BAŞLA</span>
                </button>
                ${isProgramAdded(p.id) ? `
                    <div class="w-full sm:w-auto bg-calith-orange/10 border border-calith-orange/20 px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] text-calith-orange flex items-center justify-center gap-3">
                        <i data-lucide="check-circle" class="w-5 h-5"></i>
                        <span>PROGRAMLARINDA</span>
                    </div>` : `
                    <button onclick="addToMyPrograms('${p.id}')" class="w-full sm:w-auto btn-outline border-white/10 px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transform hover:scale-[1.05] transition-all">
                        <i data-lucide="plus-circle" class="w-5 h-5 text-calith-orange"></i>
                        <span>Programlarıma Ekle</span>
                    </button>`}
                <button onclick="exportProgramPDF()" class="w-full sm:w-auto text-gray-500 hover:text-white px-6 py-4 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                    <i data-lucide="download" class="w-4 h-4"></i>
                    <span>PDF</span>
                </button>
            </div>
        </div>`;

    if (window.lucide) lucide.createIcons();
    window.scrollTo(0, 0);
}
// ====== DUYURU YÖNETİMİ (ANNOUNCEMENTS) ======
let defaultAnnouncements = [
    { id: '1', title: 'Pazar Günü Soru-Cevap', desc: 'Form kontrolü ve program analizi için toplanıyoruz. Hemen yerini ayırt.', label: '🔴 YAKLAŞAN ETKİNLİK', icon: 'video', color: 'calith-orange', link: 'premium.html' },
    { id: '2', title: 'Sıfırdan İlk Barfiks', desc: 'Asla çekemem diyenler için hazırladığımız özel eğitim serisi yayında.', label: 'YENİ İÇERİK EKLENDİ', icon: 'flame', color: 'calith-accent', link: 'blog.html' },
    { id: '3', title: '100 Şınav Challenge', desc: 'Bu hafta her gün 100 şınav tamamlıyoruz. Skorunu toplulukta paylaş!', label: '🏆 HAFTANIN GÖREVİ', icon: 'target', color: 'green-500', link: 'premium.html' }
];

let announcements = [];

async function loadAnnouncements() {
    const sb = getSupabase();
    if (!sb) {
        announcements = defaultAnnouncements;
        if (document.getElementById('admin-ann-list')) renderAdminAnnouncements();
        if (document.getElementById('hero-slider-track')) renderAnnouncementsSlider();
        hideAdminLoading(); // Hata durumunda bile gizle
        return;
    }

    try {
        const { data, error } = await sb.from('announcements').select('*').order('created_at', { ascending: false });
        if (error || !data || data.length === 0) {
            announcements = []; // Varsayılanları burada sıfırlıyoruz (sil boş gözüksün isteği)
            if (error) console.warn("Supabase duyuru tablosu hazır değil.");
        } else {
            announcements = data;
        }
    } catch (e) {
        announcements = [];
    }

    if (document.getElementById('admin-ann-list')) renderAdminAnnouncements();
    if (document.getElementById('hero-slider-track')) renderAnnouncementsSlider();
    hideAdminLoading();
}

function renderAnnouncementsSlider() {
    const track = document.getElementById('hero-slider-track');
    const dotsContainer = document.getElementById('hero-slider-dots');
    if (!track) return;

    if (announcements.length === 0) {
        track.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500 font-bold p-8">Henüz duyuru yok.</div>';
        if (dotsContainer) dotsContainer.innerHTML = '';
        if (window.heroSlider) window.heroSlider.init(0);
        return;
    }

    const slideCount = announcements.length;
    track.style.setProperty('width', (slideCount * 100) + '%', 'important');
    const percentPerSlide = 100 / slideCount;

    track.innerHTML = announcements.map((ann, index) => {
        const hShadow = ann.color === 'calith-orange' ? 'rgba(255,107,53,0.3)' : (ann.color === 'calith-accent' ? 'rgba(0,217,255,0.3)' : (ann.color === 'green-500' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'));

        const ytRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?/\s]{11})/i;
        const ytMatch = ann.link ? ann.link.match(ytRegex) : null;
        let ytId = ytMatch ? ytMatch[1] : '';
        const isYoutube = !!ytId;

        const onClickAction = isYoutube ? `openVideoModal('${ytId}')` : `window.location.href='${ann.link}'`;

        let imageUrl = ann.image;
        if ((!imageUrl || imageUrl.trim() === '') && isYoutube) {
            imageUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }

        let mediaHtml;
        if (imageUrl && imageUrl.trim() !== '') {
            mediaHtml = `<div class="${isYoutube ? 'w-full aspect-video' : 'w-20 h-20'} rounded-2xl mb-4 sm:mb-6 flex-shrink-0 shadow-[0_20px_50px_${hShadow}] group-hover:scale-[1.02] transition-all border border-white/20 overflow-hidden bg-black relative mx-auto">
                <img src="${imageUrl}" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Media">
                ${isYoutube ? `
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all flex items-center justify-center">
                    <div class="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] group-hover:scale-110 group-hover:bg-calith-orange group-hover:text-black transition-all border border-white/20 text-white">
                        <i data-lucide="play" class="w-6 h-6 ml-1"></i>
                    </div>
                </div>
                ` : ''}
            </div>`;
        } else {
            mediaHtml = `<div class="w-24 h-24 rounded-2xl bg-${ann.color}/20 flex items-center justify-center text-${ann.color} mb-8 group-hover:scale-110 group-hover:bg-${ann.color} group-hover:text-white transition-all shadow-[0_0_30px_${hShadow}] flex-shrink-0 relative mx-auto border border-${ann.color}/20">
                <i data-lucide="${ann.icon || 'bell'}" class="w-12 h-12"></i>
            </div>`;
        }

        return `
        <div class="flex-shrink-0 h-full p-4 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer group" style="width: ${percentPerSlide}%" onclick="${onClickAction}">
            <div class="flex flex-col items-center justify-center w-full mx-auto">
                ${mediaHtml}
                <div class="flex flex-col gap-0.5 sm:gap-1.5">
                    <span class="text-[9px] sm:text-[10px] uppercase font-black tracking-[0.3em] text-${ann.color} block mx-auto">${ann.label}</span>
                    <h4 class="font-display text-xl sm:text-3xl font-bold group-hover:text-white text-gray-100 transition-colors leading-tight mx-auto">${ann.title}</h4>
                    <p class="text-[10px] sm:text-sm text-gray-500 leading-tight px-2 line-clamp-2 group-hover:text-gray-300 transition-colors text-center mx-auto">${ann.desc}</p>
                </div>
            </div>
        </div>
        `;
    }).join('');

    if (dotsContainer) {
        dotsContainer.innerHTML = announcements.map((_, i) => `<span class="w-2 h-2 rounded-full bg-white/20 hover:bg-white/50 transition-all cursor-pointer" onclick="window.heroSlider && window.heroSlider.go(${i})"></span>`).join('');
    }

    if (window.lucide) lucide.createIcons();

    if (window.heroSlider) {
        window.heroSlider.init(announcements.length);
    }
}

function openVideoModal(videoId) {
    if (!videoId) return;

    // Eğer videoId bir YouTube ID'si değil de tam URL ise ID'yi ayıkla
    if (videoId.includes('http') || videoId.includes('youtube') || videoId.includes('youtu.be')) {
        const ytRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?/\s]{11})/i;
        const ytMatch = videoId.match(ytRegex);
        if (ytMatch) videoId = ytMatch[1];
        else {
            window.open(videoId, '_blank');
            return;
        }
    }

    const modal = document.getElementById('video-modal');
    const content = document.getElementById('video-modal-content');
    const container = document.getElementById('video-container');

    if (modal && container) {
        document.body.style.overflow = 'hidden';
        container.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.classList.add('opacity-100');
            if (content) {
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            }
        }, 10);
    }
}

function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const content = document.getElementById('video-modal-content');
    const container = document.getElementById('video-container');

    if (modal) {
        document.body.style.overflow = '';
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        if (content) {
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
        }

        setTimeout(() => {
            modal.style.display = 'none';
            if (container) container.innerHTML = '';
        }, 300);
    }
}

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoModal();
});

function renderAdminAnnouncements() {
    const list = document.getElementById('admin-ann-list');
    if (!list) return;

    if (announcements.length === 0) {
        list.innerHTML = '<div class="col-span-full py-12 text-center text-gray-500 bg-white/5 rounded-2xl">Duyuru bulunamadı.</div>';
        return;
    }

    list.innerHTML = announcements.map(a => {
        let mediaHtml = (a.image && a.image.trim() !== '')
            ? `<div class="w-10 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-black/50"><img src="${a.image}" class="w-full h-full object-cover"></div>`
            : `<div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-${a.color} flex-shrink-0"><i data-lucide="${a.icon}" class="w-5 h-5"></i></div>`;

        return `
        <div class="bg-calith-dark/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-calith-orange/30 transition-all">
            <div class="flex items-center gap-4">
                ${mediaHtml}
                <div>
                    <h4 class="font-bold text-sm text-white">${a.title}</h4>
                    <p class="text-xs text-gray-500 uppercase tracking-widest">${a.label} • Link: ${a.link}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="editAnnouncement('${a.id}')" class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-calith-orange rounded-xl transition-all"><i data-lucide="edit-2" class="w-4 h-4 text-white hover:text-white"></i></button>
                <button onclick="deleteAnnouncement('${a.id}')" class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-red-500 rounded-xl transition-all"><i data-lucide="trash-2" class="w-4 h-4 text-white hover:text-white"></i></button>
            </div>
        </div>
        `;
    }).join('');
    if (window.lucide) lucide.createIcons();
}

function resetAnnouncementForm() {
    document.getElementById('ann-edit-id').value = '';
    document.getElementById('ann-label').value = '';
    document.getElementById('ann-title').value = '';
    document.getElementById('ann-desc').value = '';
    document.getElementById('ann-icon').value = 'video';
    document.getElementById('ann-color').value = 'calith-orange';
    document.getElementById('ann-link').value = '';
    const annImageEl = document.getElementById('ann-image');
    if (annImageEl) annImageEl.value = '';
}

async function saveAnnouncement() {
    const id = document.getElementById('ann-edit-id').value;
    const label = document.getElementById('ann-label').value.trim();
    const title = document.getElementById('ann-title').value.trim();
    const desc = document.getElementById('ann-desc').value.trim();
    const icon = document.getElementById('ann-icon').value;
    const color = document.getElementById('ann-color').value;
    let link = document.getElementById('ann-link').value.trim();
    if (link.startsWith('www.')) link = 'https://' + link;
    else if (link.length > 0 && !link.startsWith('http') && !link.startsWith('/') && !link.includes('.html') && link.includes('.')) link = 'https://' + link;

    if (!title || !desc || !label) {
        showToast('Lütfen başlık, etiket ve açıklamayı doldurun!');
        return;
    }

    const sb = getSupabase();
    if (!sb) {
        showToast('Supabase yapılandırılmamış!', true);
        return;
    }

    const session = await sb.auth.getSession();
    if (!session.data.session) {
        showToast('Yetkisiz işlem! Lütfen giriş yapın.', true);
        return;
    }

    const imageEl = document.getElementById('ann-image');
    const image = imageEl ? imageEl.value.trim() : '';

    const annData = { label, title, desc, icon, color, link, image };
    let error;

    if (id && id.length > 5) {
        const { error: updErr } = await sb.from('announcements').update(annData).eq('id', id);
        error = updErr;
    } else {
        const { error: insErr } = await sb.from('announcements').insert([annData]);
        error = insErr;
    }

    if (error) {
        showToast('HATA: ' + error.message, true);
    } else {
        await loadAnnouncements();
        resetAnnouncementForm();
        showToast(id ? 'Duyuru güncellendi!' : 'Duyuru eklendi!');
    }
}

async function deleteAnnouncement(id) {
    if (!confirm("Duyuruyu silmek istediğinize emin misiniz?")) return;

    if (id.length <= 5) {
        showToast("Varsayılan duyurular silinemez. Önce tabloyu ayarlamalısınız.");
        return;
    }

    const sb = getSupabase();
    if (!sb) return;

    const session = await sb.auth.getSession();
    if (!session.data.session) return;

    const { error } = await sb.from('announcements').delete().eq('id', id);
    if (error) {
        showToast('HATA: ' + error.message, true);
    } else {
        await loadAnnouncements();
        showToast('Duyuru silindi!');
    }
}

function editAnnouncement(id) {
    const a = announcements.find(x => x.id === id);
    if (!a) return;
    document.getElementById('ann-edit-id').value = a.id;
    document.getElementById('ann-label').value = a.label;
    document.getElementById('ann-title').value = a.title;
    document.getElementById('ann-desc').value = a.desc;
    document.getElementById('ann-icon').value = a.icon;
    document.getElementById('ann-color').value = a.color;
    document.getElementById('ann-link').value = a.link;
    const annImageEl = document.getElementById('ann-image');
    if (annImageEl) annImageEl.value = a.image || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- HOMECARDS LOGIC ---
let homecards = JSON.parse(localStorage.getItem('calith_homecards_cache')) || [];

function toggleHomecardLinkFields() {
    const hiddenEl = document.getElementById('hc-section');
    const section = hiddenEl ? hiddenEl.value : 'hero';

    const equipmentBlock = document.getElementById('hc-fields-equipment');
    const descBlock = document.getElementById('hc-fields-desc');
    const iconBadgeBlock = document.getElementById('hc-fields-icon-badge');
    const linkBlock = document.getElementById('hc-fields-link');

    // İkon ve Rozet (Her ikisi de bir arada)
    if (iconBadgeBlock) {
        if (section === 'hero') {
            iconBadgeBlock.classList.add('hidden');
        } else {
            iconBadgeBlock.classList.remove('hidden');
        }
    }

    // Ekipman Özel Alanları vs Normal Açıklama
    if (descBlock && equipmentBlock) {
        if (section === 'equipment') {
            descBlock.classList.add('hidden');
            equipmentBlock.classList.remove('hidden');
        } else {
            descBlock.classList.remove('hidden');
            equipmentBlock.classList.add('hidden');
        }
    }

    // Buton ve Link Alanları
    if (linkBlock) {
        const editId = document.getElementById('hc-edit-id').value;
        if (section === 'hero' || section === 'benefits') {
            linkBlock.classList.add('hidden');
        } else if (section === 'schedule') {
            // SADECE 'schedule_settings' kaydı için link alanlarını göster, diğer kartlarda (Pazartesi vb.) gizle
            if (editId === 'schedule_settings') {
                linkBlock.classList.remove('hidden');
            } else {
                linkBlock.classList.add('hidden');
            }
        } else {
            linkBlock.classList.remove('hidden');
        }
    }
}
// --- HOMECARDS RENDER VE YÜKLEME ---
async function loadHomecards() {
    const sb = getSupabase();

    // Önbeylekte veri varsa hemen render et (titremeyi önlemek için)
    if (homecards.length > 0) {
        const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('admin.html');
        const isAdmin = window.location.pathname.endsWith('admin.html');
        
        if (isIndex && !isAdmin && typeof renderFrontendHomecards === 'function') renderFrontendHomecards();
        if (isAdmin && typeof renderAdminHomecards === 'function') renderAdminHomecards();
    }

    if (!sb) {
        hideAdminLoading();
        return;
    }

    const { data, error } = await sb.from('homecards').select('*');
    if (!error && data) {
        const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('admin.html');
        
        // AKILLI KONTROL: Eğer gelen veri önbellektekiyle aynıysa render yapma (Titremeyi önler)
        const hasChanged = JSON.stringify(data) !== JSON.stringify(homecards);
        
        homecards = data;
        localStorage.setItem('calith_homecards_cache', JSON.stringify(data));

        if (hasChanged) {
            if (typeof renderFrontendHomecards === 'function' && (isIndex && !window.location.pathname.endsWith('admin.html'))) {
                renderFrontendHomecards();
            }
            if (typeof renderAdminHomecards === 'function' && window.location.pathname.endsWith('admin.html')) {
                renderAdminHomecards();
            }
        }
    }
    hideAdminLoading();
}

async function saveHomecard() {
    const section = document.getElementById('hc-section').value;
    const title = document.getElementById('hc-title').value.trim();
    if (!title) return alert('Başlık zorunludur!');

    let desc = document.getElementById('hc-desc').value.trim();
    if (section === 'equipment') {
        const needs = document.getElementById('hc-eq-needs').value.trim();
        let cost = document.getElementById('hc-eq-cost').value.trim();
        const reason = document.getElementById('hc-eq-reason').value.trim();

        // Otomatik TL (₺) işareti ekleme
        if (cost && !cost.includes('₺') && !cost.toLowerCase().includes('tl')) {
            cost = cost + '₺';
        }

        desc = `İhtiyacın: ${needs}\nMaliyet: ${cost}${reason ? `\nNeden: ${reason}` : ''}`;
    }

    const hcData = {
        section: section,
        icon: document.getElementById('hc-icon').value.trim(),
        badge: document.getElementById('hc-badge').value.trim(),
        title: title,
        desc_text: desc,
        link_text: document.getElementById('hc-link-text').value.trim(),
        link_url: document.getElementById('hc-link-url').value.trim()
    };

    const editId = document.getElementById('hc-edit-id').value;
    const sb = getSupabase();
    if (!sb) return;

    let result;
    if (editId) {
        result = await sb.from('homecards').update(hcData).eq('id', editId);
    } else {
        // Yeni bir id oluştur
        const generatedId = section + '_' + Date.now();
        hcData.id = generatedId;
        result = await sb.from('homecards').insert([hcData]);
    }

    if (result.error) {
        alert('Hata: ' + result.error.message);
    } else {
        showToast(editId ? 'Ana Sayfa Kartı Güncellendi' : 'Yeni Kart Eklendi');
        resetHomecardForm();
        loadHomecards();
    }
}

async function importHomecardDefaults() {
    const sb = getSupabase();
    if (!sb) return alert('Supabase hazır değil.');
    if (!confirm('Ana sayfa için tüm varsayılan kartları (Hero, Kazançlar, Seviyeler, Program ve Aşamalar) yüklemek istediğinize emin misiniz?')) return;

    const defaults = [
        // HERO
        { id: 'hero_1', section: 'hero', title: 'Kendi Vücudunla Çalış.<br><span class="gradient-text">Sınırlarını</span> Zorla.', desc_text: 'Sadece şınav, barfiks ve squat ile evinde profesyonel formuna ulaş. Ekipman? Sonradan düşünürüz. Şimdi başla, tamamen ücretsiz.' },

        // BENEFITS
        { id: 'ben_1', section: 'benefits', icon: '💪', title: 'Kas İnşa', desc_text: 'Ağırlık salonu gerektirmez. Vücut ağırlığın yeterli.' },
        { id: 'ben_2', section: 'benefits', icon: '🏠', title: 'Evde Yap', desc_text: 'Seyahatte, parkta, odanda. Her yer spor salonun olur.' },
        { id: 'ben_3', section: 'benefits', icon: '⏱️', title: 'Zaman Tasarrufu', desc_text: 'Günde sadece 20-30 dakika. Uzun saatler gerektirmez.' },

        // LEVELS
        { id: 'lvl_1', section: 'levels', icon: '🌱', title: 'SIFIRDAN', desc_text: 'Hiç şınav yapamıyorum.\\nHareketler: Duvar şınavı, Koltuk dips\'i, Air squat', link_text: 'İncele', link_url: 'skills.html?level=baslangic' },
        { id: 'lvl_2', section: 'levels', icon: '🌿', badge: 'En Popüler', title: 'TEMEL ATILDI', desc_text: '10-15 şınav yapabiliyorum.\\nHareketler: Normal şınav, Negatif barfiks, Jackknife', link_text: 'İncele', link_url: 'skills.html?level=orta' },
        { id: 'lvl_3', section: 'levels', icon: '🔥', title: 'GÜÇLENİYORUM', desc_text: '20+ şınav yapabiliyorum.\\nHareketler: Tek kol şınav, Muscle-up denemeleri, Front lever', link_text: 'İncele', link_url: 'skills.html?level=ileri' },

        // SCHEDULE
        { id: 'sch_1', section: 'schedule', icon: '01', badge: 'Üst Vücut (20 dk)', title: 'PAZARTESİ', desc_text: '✓ Duvar şınavı: 3 set\\n✓ Koltuk dips\'i: 3 set\\n✓ Superman: 3 set', link_text: 'Hareketleri İzle →', link_url: 'blog.html' },
        { id: 'sch_2', section: 'schedule', icon: '02', badge: 'Alt Vücut (20 dk)', title: 'ÇARŞAMBA', desc_text: '✓ Air squat: 3 set\\n✓ Lunges: 3 set\\n✓ Calf raises: 3 set', link_text: 'Hareketleri İzle →', link_url: 'blog.html' },
        { id: 'sch_3', section: 'schedule', icon: '03', badge: 'Tüm Vücut (25 dk)', title: 'CUMA', desc_text: '✓ Duvar şınavı: 3 set\\n✓ Glute bridge: 3 set\\n✓ Plank: 3 set', link_text: 'Hareketleri İzle →', link_url: 'blog.html' },

        // EQUIPMENT (AŞAMALAR)
        { id: 'eq_1', section: 'equipment', badge: '🟢 Aşama 1', title: 'ŞU AN (0-2 AY)', desc_text: 'İhtiyacın: Sadece bu rehber ve biraz yer\\nMaliyet: 0₺', link_text: 'Programı İndir →', link_url: 'skills.html' },
        { id: 'eq_2', section: 'equipment', badge: '🟡 Aşama 2', title: 'TEMEL GÜÇ (2-6 AY)', desc_text: 'İhtiyacın: Kapı Barfiksi + Yoga Matı\\nMaliyet: ~400-600₺\\nNeden: Normal barfiks, yer hareketleri için stabil zemin', link_text: 'Ürünleri İncele →', link_url: 'shop.html' },
        { id: 'eq_3', section: 'equipment', badge: '🔴 Aşama 3', title: 'İLERİ SEVİYE (6+ AY)', desc_text: 'İhtiyacın: Paralel Barlar + Direnç Bandı\\nMaliyet: ~1.200-1.800₺\\nNeden: Dips, ileri hareketler, yardımcı egzersizler', link_text: 'Ürünleri İncele →', link_url: 'shop.html' }
    ];

    const { error } = await sb.from('homecards').upsert(defaults);
    if (error) {
        alert('Hata: ' + error.message);
    } else {
        showToast('Varsayılan kartlar başarıyla yüklendi');
        loadHomecards();
    }
}

function resetHomecardForm() {
    document.getElementById('hc-edit-id').value = '';
    document.getElementById('hc-title').value = '';
    document.getElementById('hc-icon').value = '';
    document.getElementById('hc-badge').value = '';
    document.getElementById('hc-desc').value = '';
    document.getElementById('hc-eq-needs').value = '';
    document.getElementById('hc-eq-cost').value = '';
    document.getElementById('hc-eq-reason').value = '';
    document.getElementById('hc-link-text').value = '';
    document.getElementById('hc-link-url').value = '';
    if (typeof toggleHomecardLinkFields === 'function') toggleHomecardLinkFields();
}

async function saveScheduleGlobalSettings() {
    const text = document.getElementById('sch-global-text').value.trim();
    const url = document.getElementById('sch-global-url').value.trim();
    
    if(!text) return alert('Buton metni boş olamaz!');

    const sb = getSupabase();
    if(!sb) return;

    const btn = document.getElementById('btn-sch-global-save');
    if(btn) btn.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-2"></span> Kaydediliyor...';

    const { error } = await sb.from('homecards').upsert({
        id: 'schedule_settings',
        section: 'schedule',
        title: 'SECTION_SETTINGS_HIDDEN',
        link_text: text,
        link_url: url
    });

    if(error) {
        alert('Hata: ' + error.message);
    } else {
        showToast('Bölüm ayarları güncellendi');
        await loadHomecards();
    }
    
    if(btn) btn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> Ayarları Kaydet ve Güncelle';
    if(window.lucide) lucide.createIcons();
}

function editHomecard(id) {
    const hc = homecards.find(x => x.id === id);
    if (!hc) return;

    filterAdminHomecards(hc.section, true);

    document.getElementById('hc-edit-id').value = hc.id;
    document.getElementById('hc-icon').value = hc.icon || '';
    document.getElementById('hc-badge').value = hc.badge || '';
    document.getElementById('hc-title').value = hc.title;
    document.getElementById('hc-desc').value = hc.desc_text || '';

    if (hc.section === 'equipment' && hc.desc_text) {
        // Kutular nce bir temizleyelim
        document.getElementById('hc-eq-needs').value = '';
        document.getElementById('hc-eq-cost').value = '';
        document.getElementById('hc-eq-reason').value = '';

        // Akll Blme: Anahtar kelimelerin nne satr sonu ekleyerek parala
        let raw = hc.desc_text.replace(/\\n/g, '\n');
        raw = raw.replace(/(Maliyet:|Neden:|İhtiyacın:|İhtiyaç:)/gi, '\n$1');

        const lines = raw.split('\n');

        lines.forEach(line => {
            const clean = line.trim();
            if (!clean) return;
            const lowerLine = clean.toLocaleLowerCase('tr-TR');

            // Her satır sadece kendi anahtarının verisini alsın
            if (lowerLine.includes('ihtiyacın:') || lowerLine.includes('ihtiyaç:')) {
                let val = clean.split(':').slice(1).join(':').trim();
                val = val.split(/(Maliyet:|Neden:|İhtiyacın:|İhtiyaç:)/i)[0].trim();
                document.getElementById('hc-eq-needs').value = val;
            }
            else if (lowerLine.includes('maliyet:')) {
                let val = clean.split(':').slice(1).join(':').trim();
                val = val.split(/(Maliyet:|Neden:|İhtiyacın:|İhtiyaç:)/i)[0].trim();
                document.getElementById('hc-eq-cost').value = val;
            }
            else if (lowerLine.includes('neden:')) {
                let val = clean.split(':').slice(1).join(':').trim();
                val = val.split(/(Maliyet:|Neden:|İhtiyacın:|İhtiyaç:)/i)[0].trim();
                document.getElementById('hc-eq-reason').value = val;
            }
        });
    }

    document.getElementById('hc-link-text').value = hc.link_text || '';
    document.getElementById('hc-link-url').value = hc.link_url || '';
    if (typeof toggleHomecardLinkFields === 'function') toggleHomecardLinkFields();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteHomecard(id) {
    if (!confirm('Bu ana sayfa kartını silmek istediğinize emin misiniz?')) return;
    const sb = getSupabase();
    if (sb) {
        const { error } = await sb.from('homecards').delete().eq('id', id);
        if (!error) {
            showToast('Kart Silindi');
            loadHomecards();
        } else {
            alert('Silme Hatası: ' + error.message);
        }
    }
}

let currentHomecardFilter = 'hero';

const hcSectionLabels = {
    'hero': 'AİT OLDUĞU BÖLÜM: ANA BAŞLIK',
    'benefits': 'AİT OLDUĞU BÖLÜM: KAZANÇLAR (SANA NE KAZANDIRIR)',
    'levels': 'AİT OLDUĞU BÖLÜM: 3 SEVİYE',
    'schedule': 'AİT OLDUĞU BÖLÜM: HAFTALIK PROGRAM',
    'equipment': 'AİT OLDUĞU BÖLÜM: EKİPMAN YOL HARİTASI'
};

function filterAdminHomecards(section, skipReset = false) {
    if (!section || section === 'all') section = 'hero';
    currentHomecardFilter = section;

    const hiddenEl = document.getElementById('hc-section');
    const labelEl = document.getElementById('hc-section-label');
    if (hiddenEl) hiddenEl.value = section;
    if (labelEl) labelEl.textContent = hcSectionLabels[section] || 'BÖLÜM SEÇİLDİ';

    if (!skipReset) resetHomecardForm();
    if (typeof toggleHomecardLinkFields === 'function') toggleHomecardLinkFields();

    renderAdminHomecards();
    const btnIds = ['hero', 'benefits', 'levels', 'schedule', 'equipment'];
    btnIds.forEach(id => {
        const btn = document.getElementById('hc-filter-' + id);
        if (btn) {
            if (id === section) {
                btn.className = "text-xs font-bold uppercase py-2 px-4 rounded-lg bg-calith-orange text-white transition-colors";
            } else {
                btn.className = "text-xs font-bold uppercase py-2 px-4 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors";
            }
        }
    });
}

function renderAdminHomecards() {
    const list = document.getElementById('admin-hc-list');
    if (!list) return;

    if (!homecards || homecards.length === 0) {
        list.innerHTML = '<div class="text-gray-500 py-4 text-sm font-bold uppercase tracking-widest text-center">Kayıtlı ana sayfa kartı yok.</div>';
        return;
    }

    let filtered = homecards;
    if (currentHomecardFilter !== 'all') {
        filtered = homecards.filter(hc => hc.section === currentHomecardFilter);
    }

    if (filtered.length === 0) {
        list.innerHTML = '<div class="text-gray-500 py-4 text-sm font-bold uppercase tracking-widest text-center">Bu bölümde henüz kart yok.</div>';
        return;
    }

    // Ayarlar kaydını ana listeden gizle
    const mainCards = filtered.filter(hc => hc.id !== 'schedule_settings');
    const scheduleSettings = filtered.find(hc => hc.id === 'schedule_settings');

    list.innerHTML = mainCards.map(hc => `
        <div class="glass-card hover:bg-white/5 p-5 rounded-2xl flex items-center justify-between group transition-all duration-300">
            <div class="flex items-center gap-5">
                <div class="w-14 h-14 rounded-2xl bg-calith-orange/10 flex items-center justify-center text-3xl shadow-inner">${hc.icon || '📌'}</div>
                <div>
                    <h4 class="font-bold text-base text-white tracking-tight">${hc.title}</h4>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-[9px] bg-white/5 text-gray-500 px-2 py-0.5 rounded-full uppercase font-black tracking-widest border border-white/5">${hc.section}</span>
                        ${hc.badge ? `<span class="text-[9px] bg-calith-orange/10 text-calith-orange px-2 py-0.5 rounded-full uppercase font-black tracking-widest border border-calith-orange/20">${hc.badge}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="editHomecard('${hc.id}')" class="w-11 h-11 flex items-center justify-center bg-white/5 hover:bg-calith-orange text-gray-400 hover:text-white rounded-xl transition-all shadow-lg" title="Düzenle"><i data-lucide="edit-2" class="w-5 h-5 pointer-events-none"></i></button>
                <button onclick="deleteHomecard('${hc.id}')" class="w-11 h-11 flex items-center justify-center bg-white/5 hover:bg-red-500 text-gray-400 hover:text-white rounded-xl transition-all shadow-lg" title="Sil"><i data-lucide="trash-2" class="w-5 h-5 pointer-events-none"></i></button>
            </div>
        </div>
    `).join('');

    // Eğer schedule bölümündeysek, listenin altına özel bir ayar kutusu ekle
    if (currentHomecardFilter === 'schedule') {
        const setLink = scheduleSettings ? scheduleSettings.link_url : '';
        const setTxt = scheduleSettings ? scheduleSettings.link_text : 'Hareketleri İzle';

        list.innerHTML += `
            <div class="mt-12 pt-8 border-t border-white/10">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-8 h-8 rounded-lg bg-calith-orange/20 flex items-center justify-center text-calith-orange">
                        <i data-lucide="settings" class="w-4 h-4"></i>
                    </div>
                    <h4 class="font-display text-lg font-bold tracking-tight uppercase">Bölüm Genel Ayarları <span class="text-xs text-gray-500 font-medium normal-case ml-2">(Tüm kartlar için ortak buton)</span></h4>
                </div>
                
                <div class="bg-black/30 border border-white/5 p-8 rounded-3xl space-y-6">
                    <div class="grid md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Buton Yazısı</label>
                            <input type="text" id="sch-global-text" value="${setTxt}" placeholder="Örn: Hareketleri İzle" class="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-xl focus:border-calith-orange outline-none transition-all placeholder:text-gray-700">
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Buton Link (URL / YT ID)</label>
                            <input type="text" id="sch-global-url" value="${setLink}" placeholder="dQw4w9WgXcQ veya URL" class="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-xl focus:border-calith-orange outline-none transition-all placeholder:text-gray-700">
                        </div>
                    </div>
                    <button id="btn-sch-global-save" onclick="saveScheduleGlobalSettings()" class="w-full btn-primary py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-calith-orange/10 flex items-center justify-center gap-2">
                        <i data-lucide="save" class="w-4 h-4"></i>
                        Ayarları Kaydet ve Güncelle
                    </button>
                </div>
            </div>
        `;
    }

    if (window.lucide) lucide.createIcons();
}

function renderFrontendHomecards() {
    if (!homecards || homecards.length === 0) return;

    const hero = homecards.find(h => h.section === 'hero');
    if (hero) {
        const titleEl = document.getElementById('hero-title');
        const subEl = document.getElementById('hero-subtitle');
        if (titleEl) titleEl.innerHTML = hero.title;
        if (subEl) subEl.innerHTML = hero.desc_text;
    }

    const benefits = homecards.filter(h => h.section === 'benefits').sort((a, b) => (a.id > b.id ? 1 : -1));
    if (benefits.length > 0) {
        const grid = document.getElementById('benefits-grid');
        if (grid) {
            grid.innerHTML = benefits.map((b, i) => `
                <div class="relative card-hover product-card rounded-3xl p-8 group cursor-pointer hover:border-calith-orange/30 transition-all flex flex-col items-start fade-in stagger-${(i % 3) + 1}" onclick="this.classList.toggle('is-open'); this.querySelector('.chevron-icon')?.classList.toggle('rotate-180')">
                    <div class="absolute top-8 right-8 rounded-full bg-white/5 w-10 h-10 flex items-center justify-center text-gray-400 group-hover:text-white group-[.is-open]:text-calith-orange transition-all">
                        <i data-lucide="chevron-down" class="chevron-icon w-5 h-5 transition-transform duration-300"></i>
                    </div>
                    <div class="feature-icon w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                        <div class="text-4xl">${b.icon || '💪'}</div>
                    </div>
                    <h3 class="font-display text-2xl font-bold mb-3 uppercase group-[.is-open]:text-calith-orange transition-colors">${b.title}</h3>
                    <div class="w-full">
                        <p class="text-gray-400 leading-relaxed whitespace-pre-line line-clamp-2 group-[.is-open]:line-clamp-none transition-all">${b.desc_text || ''}</p>
                    </div>
                </div>
            `).join('');
            if (window.lucide) lucide.createIcons();
            initScrollReveal();
        }
    }

    const levels = homecards.filter(h => h.section === 'levels').sort((a, b) => (a.id > b.id ? 1 : -1));
    if (levels.length > 0) {
        const grid = document.getElementById('levels-grid');
        if (grid) {
            grid.innerHTML = levels.map((lvl, i) => {
                const isPop = lvl.badge ? true : false;
                const borderClass = isPop ? 'border-calith-orange/30 shadow-2xl shadow-calith-orange/5' : 'border-white/5';

                return `
                <div onclick="window.location.href='${lvl.link_url || 'skills.html'}'" class="bg-calith-dark/50 border ${borderClass} rounded-3xl p-8 flex flex-col hover:border-calith-orange/30 transition-all card-hover group cursor-pointer text-center relative fade-in stagger-${(i % 3) + 1}">
                    ${isPop ? '<div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-calith-orange text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">' + lvl.badge + '</div>' : ''}
                    <div class="text-5xl mb-6">${lvl.icon || '🌱'}</div>
                    <h3 class="font-display text-2xl font-bold mb-2 uppercase">${lvl.title}</h3>
                    <div class="bg-black/30 rounded-2xl p-5 w-full mb-8 text-left border border-white/5">
                        <p class="text-[15px] text-gray-300 leading-relaxed tracking-wide whitespace-pre-line">${lvl.desc_text || ''}</p>
                    </div>
                    <div class="mt-auto">
                        <button class="w-full ${isPop ? 'btn-primary' : 'btn-outline border-white/10 group-hover:border-calith-orange group-hover:bg-calith-orange group-hover:text-white'} py-4 rounded-xl font-bold text-sm transition-all uppercase tracking-widest mb-3">Ben Buradayım</button>
                        <span class="text-xs ${isPop ? 'text-calith-orange' : 'text-gray-500'} font-bold uppercase tracking-widest group-hover:text-calith-orange transition-colors">→ ${lvl.link_text || 'İncele'}</span>
                    </div>
                </div>
                `;
            }).join('');
            if (window.lucide) lucide.createIcons();
            initScrollReveal();
        }
    }

    const scheduleData = homecards.filter(h => h.section === 'schedule');
    if (scheduleData.length > 0) {
        // Ayarlar kaydını ayır (gerçek kartlardan gizle)
        const settings = scheduleData.find(h => h.id === 'schedule_settings');
        const schedule = scheduleData.filter(h => h.id !== 'schedule_settings').sort((a,b)=> (a.id > b.id ? 1 : -1));

        // Global Butonu Güncelle
        const globalBtn = document.getElementById('schedule-global-btn');
        const globalBtnText = document.getElementById('schedule-global-btn-text');
        if (globalBtn && settings) {
            globalBtn.onclick = () => {
                if (typeof openVideoModal === 'function') openVideoModal(settings.link_url || '');
            };
            if (globalBtnText) globalBtnText.textContent = settings.link_text || 'Hareketleri İzle';
        }

        const grid = document.getElementById('schedule-grid');
        if (grid && schedule.length > 0) {
            const group1 = schedule.slice(0, 3);
            const group2 = schedule.slice(3, 5);

            const renderCard = (sch, i) => {
                const colorMap = ['calith-orange', 'calith-accent', 'red-500', 'green-500'];
                const c = colorMap[i % colorMap.length];
                const listItems = (sch.desc_text || '').split(/\n|\\n/).filter(l => l.trim().length > 0).map(l =>
                    `<li class="flex items-start gap-3 pb-2.5 border-b border-white/[0.05] last:border-0"><span class="text-${c} shrink-0 mt-0.5 font-bold text-lg">✓</span><span class="text-gray-400 font-medium tracking-tight">${l.trim().replace(/^[-✓* ]+/, '')}</span></li>`
                ).join('');

                return `
                <div onclick="toggleScheduleGroup(${i})" id="home-day-card-${i}" class="program-card bg-calith-gray border border-white/5 rounded-[1.5rem] p-7 lg:p-8 hover:border-white/20 transition-all duration-500 group shadow-xl relative overflow-hidden fade-in stagger-${(i % 3) + 1}" data-expanded="1">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-${c}/5 blur-3xl rounded-full"></div>
                    <div class="flex flex-col w-full relative z-10">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-${c}/10 flex items-center justify-center font-display font-bold text-xl text-${c} shrink-0">${sch.icon || ('0' + (i + 1))}</div>
                                <div>
                                    <h4 class="font-bold text-lg text-white tracking-tight uppercase">${sch.title}</h4>
                                    <span class="text-gray-500 font-bold text-[9px] uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">${sch.badge || ''}</span>
                                </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" class="chevron-icon w-5 h-5 text-gray-500 group-hover:text-white transition-all duration-500 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        
                        <div class="program-list-wrapper mt-8">
                            <div class="program-list-fade opacity-0"></div>
                            <div class="program-list-container" style="max-height: none; opacity: 1;">
                                <ul class="text-sm space-y-3">
                                    ${listItems}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            };

            let gridHtml = `
                <!-- Üst Grup -->
                <div class="col-span-full mb-4">
                    <div class="grid lg:grid-cols-3 gap-6">
                        ${group1.map((sch, i) => renderCard(sch, i)).join('')}
                    </div>
                </div>
            `;

            if (group2.length > 0) {
                gridHtml += `
                <!-- Alt Grup -->
                <div class="col-span-full mt-4">
                    <div class="grid lg:grid-cols-3 gap-6">
                        ${group2.map((sch, i) => renderCard(sch, i + 3)).join('')}
                    </div>
                </div>
                `;
            }

            grid.innerHTML = gridHtml;
            grid.className = "grid grid-cols-1 gap-6 fade-in"; // Grid yapısını konteynerlar yönetecek
            
            if (window.lucide) lucide.createIcons();
            if (typeof initScrollReveal === 'function') initScrollReveal();
        }
    }
    const equipment = homecards.filter(h => h.section === 'equipment').sort((a, b) => (a.id > b.id ? 1 : -1));
    if (equipment.length > 0) {
        const grid = document.getElementById('equipment-grid');
        if (grid) {
            grid.className = "grid md:grid-cols-3 gap-8"; // fade-in kaldrld
            grid.innerHTML = equipment.map((eq, i) => {
                const isPop = i === 1; // Stage 2 is usually centered/highlighted
                const borderClass = isPop ? 'border-calith-orange/30 shadow-2xl shadow-calith-orange/10' : 'border-white/5';
                const hoverClass = isPop ? 'hover:border-calith-orange/50' : 'hover:border-white/20';
                const btnClass = isPop ? 'btn-primary' : 'btn-outline border-white/10 hover:bg-white/5';

                let badgeColor = 'calith-orange';
                if (eq.badge) {
                    if (eq.badge.includes('1')) badgeColor = 'green-500';
                    else if (eq.badge.includes('2')) badgeColor = 'yellow-500';
                    else if (eq.badge.includes('3')) badgeColor = 'red-500';
                }

                // En Akll Metin Ayklama (Son girilen veriyi nceler)
                let rawText = (eq.desc_text || '');
                rawText = rawText.replace(/(Maliyet:|Neden:|İhtiyacın:|İhtiyaç:)/gi, '\n$1');

                const lines = rawText.split(/\n|\\n/);
                const blocks = {};
                const infoLines = [];

                lines.forEach(line => {
                    const cleanLine = line.trim().replace(/^[-*•● ]+/, '');
                    if (!cleanLine) return;

                    const parts = cleanLine.split(':');
                    if (parts.length > 1) {
                        const key = parts[0].trim();
                        const val = parts.slice(1).join(':').trim();
                        if (val) blocks[key.toLocaleLowerCase('tr-TR')] = { key, val }; // Son gelen eskisinizerine yazar
                    } else {
                        infoLines.push(cleanLine);
                    }
                });

                let descHtml = '';
                // nce anahtar bloklar dzelim
                Object.values(blocks).forEach(block => {
                    const isMaliyet = block.key.toLocaleLowerCase('tr-TR').includes('maliyet');
                    descHtml += `
                    <div class="mb-5 last:mb-0">
                        <p class="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1.5 opacity-60">${block.key}</p>
                        <p class="${isMaliyet ? 'text-white text-2xl font-black font-display tracking-tight' : 'text-gray-200 text-sm font-semibold leading-relaxed'}">${block.val}</p>
                    </div>`;
                });
                // Sonra ekstra info satrlarn ekleyelim
                if (infoLines.length > 0) {
                    descHtml += `<p class="text-gray-400 text-xs leading-relaxed mt-4 opacity-70 italic border-l-2 border-calith-orange/30 pl-3">${infoLines.join(' ')}</p>`;
                }

                return `
                <div class="product-card backdrop-blur-3xl bg-white/5 border ${borderClass} rounded-[2.5rem] p-10 ${hoverClass} transition-all duration-500 relative flex flex-col h-full group hover:-translate-y-2">
                    <div class="self-start w-max inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-${badgeColor}/30 text-${badgeColor} text-[10px] font-black uppercase tracking-widest mb-8 bg-${badgeColor}/10 backdrop-blur-md">
                        <span class="w-1.5 h-1.5 rounded-full bg-${badgeColor} animate-pulse shrink-0"></span>
                        ${eq.badge ? eq.badge.replace(/[^a-zA-Z0-9İıĞğÜüŞşÖöÇç ]/g, '').trim() : ('AŞAMA ' + (i + 1))}
                    </div>
                    <h3 class="font-display text-3xl font-bold mb-8 uppercase tracking-tight group-hover:text-white transition-colors leading-tight">${eq.title}</h3>
                    <div class="flex-1">
                        <div class="flex flex-col">
                            ${descHtml}
                        </div>
                    </div>
                    ${eq.link_text ? `<button onclick="window.location.href='${eq.link_url || 'shop.html'}'" class="w-full ${btnClass} py-5 rounded-2xl font-bold text-sm uppercase tracking-widest mt-10 shadow-xl transition-all hover:scale-[1.02]">${eq.link_text}</button>` : ''}
                </div>
                `;
            }).join('');
        }
    }

    if (window.lucide) lucide.createIcons();
}

// --- AUTH LOGIC ---
let currentUser = null;

function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
        toggleAuthView('login'); // Default is login
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
}

function toggleAuthView(view) {
    const loginView = document.getElementById('login-form-view');
    const registerView = document.getElementById('register-form-view');
    const title = document.getElementById('auth-title');

    if (view === 'login') {
        loginView.classList.remove('hidden');
        registerView.classList.add('hidden');
        title.textContent = 'Hoş Geldin';
    } else {
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
        title.textContent = 'Aramıza Katıl';
    }
}

async function submitLogin() {
    const email = document.getElementById('auth-login-email').value.trim();
    const pass = document.getElementById('auth-login-pass').value.trim();
    if (!email || !pass) return showToast('Lütfen bilgileri girin.');

    const sb = getSupabase();
    if (!sb) return;

    const btnTxt = document.getElementById('btn-login-txt');
    if (btnTxt) btnTxt.textContent = 'Giriş Yapılıyor...';

    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });

    if (btnTxt) btnTxt.textContent = 'Giriş Yap';

    if (error) {
        alert('Hata: ' + error.message);
    } else {
        currentUser = data.user;

        // Eğer girilen hesap admin ise, standart paneli değil admini açalım
        if (currentUser?.user_metadata?.role === 'admin') {
            showToast('Yönetici yetkisi algılandı. Lütfen logoya uzun basarak admin panele geçin.');
        } else {
            showToast('Başarıyla giriş yaptınız!');
        }

        closeAuthModal();
        updateAuthUI();
    }
}

async function submitRegister() {
    const name = document.getElementById('auth-reg-name').value.trim();
    const email = document.getElementById('auth-reg-email').value.trim();
    const pass = document.getElementById('auth-reg-pass').value.trim();
    const levelRadio = document.querySelector('input[name="fitness_level"]:checked');
    const level = levelRadio ? levelRadio.value : 'baslangic';

    if (!name || !email || !pass) return showToast('Lütfen tüm bilgileri girin!');
    if (pass.length < 6) return alert('Şifre en az 6 karakter olmalı');

    const sb = getSupabase();
    if (!sb) return;

    const btnTxt = document.getElementById('btn-reg-txt');
    if (btnTxt) btnTxt.textContent = 'Kayıt Olunuyor...';

    // Supabase Sign Up - Metadata dahil
    const { data, error } = await sb.auth.signUp({
        email,
        password: pass,
        options: {
            data: {
                full_name: name,
                username: email.split('@')[0] + '_' + Math.floor(Math.random() * 999),
                role: 'user',
                fitness_level: level
            }
        }
    });

    if (btnTxt) btnTxt.textContent = 'Topluluğa Katıl';

    if (error) {
        console.error('Registration Error Details:', error);
        alert('Kayıt Hatası: ' + error.message + ' (Kod: ' + (error.status || 'DB') + ')');
    } else {
        showToast('Kayıt işlemini tamamlamak için e-posta adresini onayla!');
        alert('Kayıt başarılı! Hesabını aktifleştirmek için e-postana gönderilen onay linkine tıklamalısın.');

        currentUser = data.user;
        closeAuthModal();
        updateAuthUI();

        // Kayıt sonrası üye sayısını anlık güncelle (500ms delay ile DB trigger bekletilir)
        setTimeout(() => {
            updateHappyMembersStats();
        }, 500);
    }
}

async function handleLogout() {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    currentUser = null;
    isAdminMode = false;
    showToast('Çıkış yapıldı');
    updateAuthUI();

    // Sayfa veya aktif section kontrolü
    const isProfileVisible = document.getElementById('profile') && !document.getElementById('profile').classList.contains('hidden');
    const isSpecialPage = window.location.pathname.includes('profile.html') || window.location.pathname.includes('admin.html');

    if (isSpecialPage || isProfileVisible) {
        setTimeout(() => {
            if (window.location.pathname.includes('index.html') || isProfileVisible) {
                showSection('landing');
            } else {
                window.location.href = 'index.html';
            }
        }, 500);
    }
}

async function checkCurrentUser() {
    const sb = getSupabase();
    if (sb) {
        const { data: { session } } = await sb.auth.getSession();
        if (session) {
            currentUser = session.user;
        }
    }
    updateAuthUI();

    // Eğer admin sayfasındaysak ve kullanıcı logged in ise admin paneli yetkisini kontrol et
    if (window.location.pathname.endsWith('admin.html')) {
        initAdminPanel();
    }
}

function initAdminPanel() {
    const loadingEl = document.getElementById('admin-loading');
    const loginEl = document.getElementById('admin-login');
    const editorEl = document.getElementById('admin-editor');

    if (!loadingEl) return; // Admin sayfasında değiliz demektir

    if (currentUser) {
        if (currentUser.user_metadata?.role === 'admin') {
            if (loadingEl) loadingEl.classList.add('hidden');
            if (loginEl) loginEl.classList.add('hidden');
            if (editorEl) editorEl.classList.remove('hidden');
            isAdminMode = true;
            if (typeof switchAdminTab === 'function') switchAdminTab('blog');
        } else {
            // Logged in ama admin değil
            alert('Bu panele erişim yetkiniz yok.');
            handleLogout();
        }
    } else {
        // Giriş yapılmamış
        if (loadingEl) loadingEl.classList.add('hidden');
        if (loginEl) loginEl.classList.remove('hidden');
        if (editorEl) editorEl.classList.add('hidden');
    }
}

function hideAdminLoading() {
    const loadingEl = document.getElementById('admin-loading');
    if (loadingEl && announcements.length > 0 && homecards.length > 0) {
        // Veriler yüklendiyse (veya hata ile sonlandıysa) loading'i kaldırabiliriz
        // Ancak initAdminPanel asıl kontrolü yapacaktır.
    }
}

function updateAuthUI() {
    // Desktop Nav Auth Button & Icon
    const authElements = document.querySelectorAll('[onclick="showAuthModal()"], [onclick="showProfile()"], [onclick="handleLogout()"], [onclick*="profile.html"]');
    
    authElements.forEach(el => {
        const isMobileIcon = el.classList.contains('md:hidden') && el.querySelector('[data-lucide="user"]');
        const isMobileMenuBtn = el.closest('#mobile-menu') && el.tagName === 'BUTTON';

        if (isMobileIcon) {
            if (currentUser) {
                el.setAttribute('onclick', "showProfile()");
                el.classList.add('text-calith-accent');
                el.classList.remove('text-white');
            } else {
                el.setAttribute('onclick', 'showAuthModal()');
                el.classList.add('text-white');
                el.classList.remove('text-calith-accent');
            }
        } else if (isMobileMenuBtn) {
            if (currentUser) {
                el.textContent = 'PROFİLİM';
                el.setAttribute('onclick', "showProfile()");
                el.classList.add('text-calith-accent');
                el.classList.remove('text-red-500', 'text-white');
            } else {
                el.textContent = 'GİRİŞ YAP / ÜYE OL';
                el.setAttribute('onclick', 'showAuthModal()');
                el.classList.remove('text-red-500', 'text-calith-accent');
                el.classList.add('text-white');
            }
        } else {
            // Desktop or generic buttons
            if (currentUser) {
                if (el.textContent.includes('GİRİŞ YAP') || el.textContent.includes('ÜYE OL') || el.textContent.includes('Giriş Yap')) {
                    el.innerHTML = el.querySelector('i') ? el.innerHTML.replace(/Giriş Yap|GİRİŞ YAP \/ ÜYE OL/g, 'PROFİLİM') : 'PROFİLİM';
                    el.setAttribute('onclick', "showProfile()");
                }
            } else {
                if (el.textContent.includes('PROFİLİM') || el.textContent.includes('Profilim')) {
                    el.innerHTML = el.querySelector('i') ? el.innerHTML.replace(/PROFİLİM|Profilim/g, 'GİRİŞ YAP') : 'GİRİŞ YAP';
                    el.setAttribute('onclick', "showAuthModal()");
                }
            }
        }
    });
}

// --- LEAD OR EMAIL COLLECTION ---
async function submitLeadForm() {
    const emailEl = document.getElementById('lead-email');
    if (!emailEl) return;

    const email = emailEl.value.trim();
    if (!email) return showToast('Lütfen e-posta adresinizi girin.');
    if (!email.includes('@') || !email.includes('.')) return showToast('Lütfen geçerli bir e-posta girin.');

    const btn = document.getElementById('btn-lead-submit');
    const oldHtml = btn ? btn.innerHTML : 'Şimdi İndir';
    if (btn) btn.innerHTML = 'Kaydediliyor... <i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>';

    const sb = getSupabase();
    if (sb) {
        const { error } = await sb.from('leads').insert([{ email }]);
        if (error) {
            console.error('Lead error:', error);
            if (error.code === '23505') {
                showToast('Bu e-posta adresi ile zaten kayıt oluşturulmuş.');
            } else {
                showToast('Kayıt başarısız, tablo ayarlarınızı kontrol edin.');
            }
        } else {
            // Başarılı olduğunda indirme linkini aç veya uyarı ver. 
            // Burada örnek olarak Toast veriyoruz ama aslında gerçek bir PDF URL verilmeli.
            showToast('Tebrikler! PDF Rehberi e-postanıza yönlendirilecektir.');
            // Ya da anında indirmek için:
            // window.open('/assets/baslangic-rehberi.pdf', '_blank');

            const modal = document.getElementById('lead-modal');
            if (modal) modal.classList.add('hidden');
            emailEl.value = '';
        }
    } else {
        showToast('Veritabanı bağlantısı bulunamadı.');
    }

    if (btn) {
        btn.innerHTML = oldHtml;
        if (window.lucide) lucide.createIcons();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initial page state & logic
    if (typeof init === 'function') init();
    await checkCurrentUser();
    updateCartUI();
    updateHappyMembersStats();

    // 2. Navigation Active State
    const path = window.location.pathname;
    let fileName = path.split('/').pop() || 'index.html';
    if (fileName === '' || fileName === 'Calith') fileName = 'index.html';

    document.querySelectorAll('nav a, #mobile-menu a').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href === fileName || (fileName === 'index.html' && href === '/')) {
            link.classList.add('text-calith-orange');
            link.classList.add('font-black');
        }
    });

    // 3. Admin Logo Logic (Long Press)
    const logo = document.getElementById('logo-container');
    if (logo) {
        let pressTimer;
        let isPressing = false;

        const startPress = (e) => {
            isPressing = true;
            logo.style.transform = 'scale(0.95)';
            pressTimer = setTimeout(() => {
                if (isPressing) {
                    isPressing = false;
                    logo.style.transform = 'scale(1)';
                    showToast('Admin modu açılıyor...');
                    setTimeout(() => showAdmin(), 500);
                }
            }, 5000);
        };

        const endPress = () => {
            isPressing = false;
            clearTimeout(pressTimer);
            logo.style.transform = 'scale(1)';
        };

        logo.addEventListener('mousedown', startPress);
        logo.addEventListener('mouseup', endPress);
        logo.addEventListener('mouseleave', endPress);
        logo.addEventListener('touchstart', (e) => { e.preventDefault(); startPress(e); }, { passive: false });
        logo.addEventListener('touchend', endPress);
    }

    // [YENİ] Flicker (Kırpışma) Önleyici: Veri yüklenmeden önce URL'e bak ve gerekirse varsayılan bölümleri gizle
    const initialParams = new URLSearchParams(window.location.search);
    if (initialParams.has('p') || initialParams.has('level')) {
        const progMain = document.getElementById('programs');
        if (progMain) progMain.classList.add('hidden'); // Veri gelene kadar ana kategorileri gizle
    }
    if (initialParams.has('b')) {
        const blogMain = document.getElementById('blog');
        if (blogMain) blogMain.classList.add('hidden');
    }

    // 4. Data Loading (Posts & Homecards)
    // Run these in parallel for speed
    const loadOps = [
        loadPosts().then(() => {
        handleRouting(); // Veriler yüklendikten sonra yönlendirmeyi yap
    }),
    (async () => {
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('admin.html')) {
            await loadAnnouncements();
            await loadHomecards();
        }
    })()
];

await Promise.all(loadOps);

// 5. Browser Geri/İleri Butonu Senkronizasyonu
window.onpopstate = () => handleRouting();

function handleRouting() {
    const params = new URLSearchParams(window.location.search);
    const programId = params.get('p');
    const blogId = params.get('b');
    const blogCat = params.get('c');
    const levelCode = params.get('level');

    // Elementlerin varlığına göre hangi sayfada olduğumuzu anlayalım (Pathname kontrolünden daha güvenli)
    const isSkillsPage = !!document.getElementById('program-list-view');
    const isBlogPage = !!document.getElementById('blog-list');
    const isShopPage = !!document.getElementById('shop-grid');
    const sectionParam = params.get('section');

    if (sectionParam === 'profile') {
        showProfile();
    } else if (isSkillsPage) {
        if (programId) {
            showProgramDetail(programId, true);
        } else if (levelCode) {
            const levelMap = { 'baslangic': 'Başlangıç', 'orta': 'Orta Seviye', 'ileri': 'İleri Seviye' };
            showProgramLevel(levelCode, levelMap[levelCode] || levelCode, true);
        } else {
            backToLevels(true);
        }
    } else if (isBlogPage) {
        if (blogId) {
            showBlogDetail(blogId);
        } else if (blogCat) {
            filterBlog(blogCat);
        } else {
            showSection('blog');
        }
    } else if (isShopPage) {
        const productId = params.get('p');
        if (productId) showProductDetail(productId);
        else showSection('shop');
    }
}

    // 5. Finishing Touches
    if (window.location.pathname.includes('shop.html')) renderShop();
    if (window.lucide) lucide.createIcons();
});

// PDF Export Logic (Cleaned for Printers)
function exportProgramPDF() {
    const printArea = document.getElementById('print-area');
    const printContent = document.getElementById('print-content');
    if (!printArea || !printContent) return;

    // 0. Yeni Kaynak: Program Detay Ekranı (Eğer açıksa)
    const detailSec = document.getElementById('blog-detail');
    const dayCards = detailSec ? Array.from(detailSec.querySelectorAll('.program-day-card')) : [];
    
    const scheduleCards = (typeof homecards !== 'undefined')
        ? homecards.filter(h => h.section === 'schedule' && h.id !== 'schedule_settings')
                   .sort((a, b) => (a.id > b.id ? 1 : -1))
        : [];

    let data = [];

    if (dayCards.length > 0) {
        data = dayCards.map(card => {
            const h4 = card.querySelector('h4');
            const badge = card.querySelector('p');
            const items = Array.from(card.querySelectorAll('ul li span'))
                               .map(s => s.innerText.trim()).filter(Boolean);
            return {
                title: h4 ? h4.innerText.trim() : '',
                badge: badge ? badge.innerText.trim() : '',
                items
            };
        });
    } else if (scheduleCards.length > 0) {
        // 1. Kaynak: homecards (Anasayfa Çizelgesi)
        data = scheduleCards.map(sch => ({
            title: sch.title || '',
            badge: sch.badge || '',
            items: (sch.desc_text || '').split(/\n|\\n/)
                       .map(l => l.trim().replace(/^[-✓* ]+/, ''))
                       .filter(l => l.length > 0)
        }));
    } else {
        // 2. Fallback: Anasayfa DOM'dan oku
        const scheduleGrid = document.getElementById('schedule-grid');
        const cards = scheduleGrid ? Array.from(scheduleGrid.querySelectorAll('.program-card:not(.animate-pulse)')) : [];

        if (cards.length > 0) {
            data = cards.map(card => {
                const h4     = card.querySelector('h4');
                const badge  = card.querySelector('.rounded-full');
                const items  = Array.from(card.querySelectorAll('ul li span:last-child'))
                                   .map(s => s.innerText.trim()).filter(Boolean);
                return {
                    title: h4 ? h4.innerText.trim() : '',
                    badge: badge ? badge.innerText.trim() : '',
                    items
                };
            });
        }
    }

    // 3. Son Fallback: Statik örnek program (her iki kaynak da boşsa)
    if (data.length === 0 || data.every(d => d.items.length === 0)) {
        data = [
            {
                title: 'GÜN 1 — ÜST VÜCUT',
                badge: 'Pazartesi / Çarşamba',
                items: ['Isınma: 5 dk yürüyüş', '3x10 Şınav', '3x8 Pike Push-up', '3x10 Dips (sandalye)', '3x12 Diamond Push-up', '2x10 Triceps Germe']
            },
            {
                title: 'GÜN 2 — ALT VÜCUT',
                badge: 'Salı / Perşembe',
                items: ['Isınma: 5 dk esneme', '4x15 Squat', '3x10 Lunges (her bacak)', '3x15 Glute Bridge', '3x20 Calf Raises', '2x30s Duvar Oturması']
            },
            {
                title: 'GÜN 3 — CORE & DİNAMİK',
                badge: 'Cuma / Cumartesi',
                items: ['Isınma: 5 dk hafif koşu', '3x45s Plank', '3x15 Crunch', '3x10 Mountain Climber', '3x10 Leg Raise', '2x20 Flutter Kicks']
            }
        ];
    }

    // 4. Notları al (Eğer varsa)
    let notes = '';
    const notesEl = detailSec ? detailSec.querySelector('.whitespace-pre-wrap') : null;
    if (notesEl) {
        notes = notesEl.innerText.trim();
    }

    renderPDF(printContent, data, notes);
}

function renderPDF(printContent, data, notes = '') {
    showToast('PDF Çizelgesi Hazırlanıyor...');

    const colCount = data.length <= 2 ? data.length : 3;

    let html = `
    <div style="width:100%;font-family:'Inter',Arial,sans-serif;color:#000;padding:20px;box-sizing:border-box;">
        <div style="text-align:center;border-bottom:3px solid #000;padding-bottom:16px;margin-bottom:24px;">
            <h1 style="font-size:24px;text-transform:uppercase;margin:0;letter-spacing:2px;">CALİSTHENİCS ANTRENMAN ÇİZELGESİ</h1>
            <p style="margin:6px 0 0;font-weight:700;color:#555;font-size:13px;">calith.com &nbsp;•&nbsp; Profesyonel Haftalık Program</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(${colCount},1fr);gap:12px;">
    `;

    html += data.map((card, i) => `
        <div style="border:2px solid #000;border-radius:10px;padding:14px;background:#f9f9f9;break-inside:avoid;">
            <div style="background:#000;color:#fff;padding:8px 10px;border-radius:6px;text-align:center;margin-bottom:10px;">
                <h3 style="margin:0;font-size:13px;text-transform:uppercase;letter-spacing:1px;">${card.title || ('GÜN ' + (i + 1))}</h3>
            </div>
            ${card.badge ? `<p style="font-size:9px;font-weight:700;text-align:center;color:#777;margin-bottom:12px;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:6px;">${card.badge}</p>` : ''}
            <ul style="list-style:none;padding:0;margin:0;font-size:11px;line-height:1.6;">
                ${card.items.map(item => `<li style="padding:4px 0;border-bottom:1px dashed #ddd;">• ${item}</li>`).join('')}
            </ul>
        </div>
    `).join('');

    html += `
        </div>
        ${notes ? `
        <div style="margin-top:20px;padding:15px;background:#f8f8f8;border-radius:10px;border-left:4px solid #000;break-inside:avoid;">
            <p style="margin:0 0 8px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#000;">PROGRAM NOTLARI:</p>
            <p style="margin:0;font-size:10px;line-height:1.5;color:#444;white-space:pre-wrap;">${notes}</p>
        </div>
        ` : ''}
        <div style="margin-top:30px;border-top:1px solid #ddd;padding-top:10px;text-align:center;font-size:9px;color:#aaa;">
            * Her antrenman öncesi 5-10 dk ısınma yapın. Form rehberi için calith.com/blog adresini ziyaret edin.
        </div>
    </div>`;

    printContent.innerHTML = html;
    // iOS/Safari için render süresini uzatıyoruz
    setTimeout(() => { window.print(); }, 1000);
}


// Global Add to Programs Placeholder
async function addToMyPrograms(programId = null) {
    const sb = getSupabase();
    if (!sb) return;

    // Eğer programId parametre olarak gelmediyse, URL'den al (Detay sayfasındaysak)
    if (!programId) {
        const params = new URLSearchParams(window.location.search);
        programId = params.get('p');
    }

    if (!programId) {
        showToast('Program ID bulunamadı.');
        return;
    }

    // Giriş kontrolü
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
        showToast('Program eklemek için giriş yapmalısınız.');
        if (typeof showAuthModal === 'function') showAuthModal();
        return;
    }

    showToast('Programa ekleniyor...');

    // user_programs tablosuna ekle
    const { error } = await sb.from('user_programs').upsert([
        { user_id: user.id, program_id: programId }
    ]);

    if (error) {
        console.error('Error adding program:', error);
        showToast('Hata: ' + error.message);
    } else {
        showToast('Program başarıyla kütüphanenize eklendi!');
    }
}

// ====== PROFİL YÖNETİMİ ======
async function showProfile() {
    const sb = getSupabase();
    if (!sb) return;

    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
        showToast('Profilinizi görmek için giriş yapmalısınız.');
        if (typeof showAuthModal === 'function') showAuthModal();
        return;
    }

    showSection('profile');
    loadProfileData(user);
    loadUserPrograms(user.id);
}

function toggleEditProfile() {
    const form = document.getElementById('edit-profile-form');
    if (form) form.classList.toggle('hidden');
}

async function loadProfileData(user) {
    const sb = getSupabase();
    if (!sb) return;

    // Elementleri seç
    const nameEl = document.getElementById('profile-name');
    const weightEl = document.getElementById('profile-weight');
    const heightEl = document.getElementById('profile-height');
    const goalEl = document.getElementById('profile-goal');
    const badgeEl = document.getElementById('profile-badge');

    // Başlangıçta skeleton efektini ekle
    const elements = [nameEl, weightEl, heightEl, goalEl];
    elements.forEach(el => { if(el) el.classList.add('skeleton'); });

    // Hızlı bilgi yükle (Metadatadan)
    if (nameEl) nameEl.textContent = user.user_metadata?.full_name || user.email.split('@')[0];
    document.getElementById('profile-email').textContent = user.email;

    // Her iki tabloyu paralel çek
    // user_roles = gerçek yetki kaynağı | profiles = profil verisi
    const [profileResult, roleResult] = await Promise.all([
        sb.from('profiles').select('*').eq('id', user.id).single(),
        sb.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
    ]);
    
    // Skeleton efektini kaldır
    elements.forEach(el => { if(el) el.classList.remove('skeleton'); });

    const data = profileResult.data;
    if (!profileResult.error && data) {
        if (data.full_name && nameEl) nameEl.textContent = data.full_name;
        if (weightEl) weightEl.textContent = data.weight ? data.weight + ' KG' : '--';
        if (heightEl) heightEl.textContent = data.height ? data.height + ' CM' : '--';
        if (goalEl) goalEl.textContent = data.goal || '--';
        
        const levelEl = document.getElementById('profile-level');
        if (levelEl) levelEl.textContent = data.fitness_level || 'BAŞLANGIÇ';

        // Formu doldur
        const editName = document.getElementById('edit-full-name');
        const editWeight = document.getElementById('edit-weight');
        const editHeight = document.getElementById('edit-height');
        const editGoal = document.getElementById('edit-goal');

        if (editName) editName.value = data.full_name || user.user_metadata?.full_name || '';
        if (editWeight) editWeight.value = data.weight || '';
        if (editHeight) editHeight.value = data.height || '';
        if (editGoal) editGoal.value = data.goal || 'Kas Kazanmak';
    }

    // ===== ROZET SİSTEMİ =====
    // Önce user_roles'a bak (yetkili kaynak), yoksa profiles.role'a fallback
    if (badgeEl) {
        const authorizedRole = roleResult.data?.role;          // user_roles tablosu
        const profileRole    = profileResult.data?.role;       // profiles tablosu (fallback)
        const role = (authorizedRole || profileRole || 'user').toLowerCase();

        const roleConfig = {
            admin: {
                label: '⚡ ADMİN',
                classes: 'bg-red-500/15 text-red-400 border-red-500/30'
            },
            mod: {
                label: '🛡 MOD',
                classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
            },
            premium: {
                label: '👑 PREMİUM',
                classes: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
            },
            user: {
                label: 'ÜYE',
                classes: 'bg-calith-orange/10 text-calith-orange border-calith-orange/20'
            }
        };

        const config = roleConfig[role] || roleConfig['user'];
        badgeEl.textContent = config.label;
        badgeEl.className = 'px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ' + config.classes;
    }
}





async function saveProfileData() {
    const sb = getSupabase();
    if (!sb) return;

    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    const profileData = {
        id: user.id,
        full_name: document.getElementById('edit-full-name').value,
        weight: parseFloat(document.getElementById('edit-weight').value),
        height: parseFloat(document.getElementById('edit-height').value),
        goal: document.getElementById('edit-goal').value
    };

    const { error } = await sb.from('profiles').upsert(profileData);

    if (error) {
        showToast('Hata: ' + error.message);
    } else {
        showToast('Profil güncellendi!');
        toggleEditProfile();
        loadProfileData(user);
    }
}

async function loadUserPrograms(userId) {
    const sb = getSupabase();
    if (!sb) return;

    const { data, error } = await sb.from('user_programs').select('program_id').eq('user_id', userId);
    
    if (!error && data) {
        const programIds = data.map(d => String(d.program_id));
        myProgramIds = programIds; // Global listeyi güncelle
        
        const myPrograms = posts.filter(p => programIds.includes(String(p.id)));
        renderUserPrograms(myPrograms);
    }
}

function renderUserPrograms(programs) {
    const container = document.getElementById('user-programs-list');
    if (!container) return;

    if (programs.length === 0) {
        container.innerHTML = `
            <div class="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i data-lucide="plus" class="w-8 h-8 text-gray-600"></i>
                </div>
                <p class="text-gray-500 font-medium">Henüz bir program eklemedin.</p>
                <button onclick="showSection('skills')" class="mt-4 text-calith-orange font-bold text-xs uppercase tracking-widest underline">Programlara Göz At</button>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    container.innerHTML = programs.map((p, i) => `
        <div onclick="showProgramDetail('${p.id}')" class="group cursor-pointer relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-calith-orange/30 rounded-[2rem] p-4 sm:p-6 transition-all duration-500 flex flex-col lg:flex-row items-center gap-6 overflow-hidden">
            <div class="absolute -left-4 -bottom-4 text-[6rem] font-black text-white/[0.02] pointer-events-none group-hover:text-calith-orange/[0.03] transition-colors duration-700 select-none">0${i+1}</div>
            
            <div class="w-full lg:w-32 aspect-video lg:aspect-square rounded-2xl overflow-hidden shrink-0 border border-white/10 group-hover:border-calith-orange/30 transition-all duration-500">
                <img src="${p.image}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110">
            </div>

            <div class="flex-1 text-center lg:text-left relative z-10">
                <h3 class="font-display text-xl sm:text-2xl font-bold mb-2 tracking-tight group-hover:text-white transition-colors uppercase leading-tight">${p.title}</h3>
                <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-gray-500">
                    <div class="flex items-center gap-2">
                        <i data-lucide="clock" class="w-3.5 h-3.5 text-calith-orange"></i>
                        <span class="text-[9px] font-black uppercase tracking-widest">Haftalık 5 Gün</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i data-lucide="zap" class="w-3.5 h-3.5 text-calith-orange"></i>
                        <span class="text-[9px] font-black uppercase tracking-widest">Aktif</span>
                    </div>
                </div>
            </div>

            <div class="shrink-0 relative z-10">
                <div class="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-calith-orange transition-all duration-500">
                    <i data-lucide="arrow-right" class="w-5 h-5 text-white"></i>
                </div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

async function loadWorkoutLogs(userId) {
    const sb = getSupabase();
    if (!sb) return;

    const { data, error } = await sb.from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
    
    if (!error && data) {
        renderWorkoutLogs(data);
    }
}

function renderWorkoutLogs(logs) {
    const container = document.getElementById('workout-logs-list');
    if (!container) return;

    if (logs.length === 0) return;

    container.innerHTML = logs.map(log => {
        const date = new Date(log.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
        const time = new Date(log.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="group bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:border-calith-accent/30 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-calith-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i data-lucide="award" class="w-5 h-5 text-calith-accent"></i>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-gray-200 uppercase tracking-tight">${log.program_title}</h4>
                        <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">${date} • ${time}</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-xs font-mono font-bold text-white">${log.duration}</div>
                    <div class="text-[9px] text-gray-600 font-black uppercase tracking-widest">${log.day_name}</div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

// Program Card Toggle (Her kart bağımsız açılır/kapanır)
function toggleScheduleGroup(index) {
    const indices = index <= 2 ? [0, 1, 2] : [3, 4];
    
    // Grubun durumunu kontrol etmek için sayfada var olan ilk elemanı baz alalım
    let firstCard = document.getElementById(`home-day-card-${indices[0]}`);
    if (!firstCard) return;

    const isCurrentlyExpanded = firstCard.dataset.expanded === '1';
    const shouldExpand = !isCurrentlyExpanded;
    
    indices.forEach(idx => {
        const card = document.getElementById(`home-day-card-${idx}`);
        if (!card) return;

        const container = card.querySelector('.program-list-container');
        const fade = card.querySelector('.program-list-fade');
        const chevron = card.querySelector('.chevron-icon');
        if (!container) return;

        container.style.transition = 'max-height 0.5s ease, opacity 0.4s ease';
        
        if (shouldExpand) {
            container.style.maxHeight = (container.scrollHeight + 40) + 'px';
            container.style.opacity = '1';
            if (fade) fade.style.opacity = '0';
            if (chevron) chevron.style.transform = 'rotate(180deg)';
            card.dataset.expanded = '1';
        } else {
            container.style.maxHeight = '110px';
            container.style.opacity = '1'; // Kapalıyken de görünür kalsın
            if (fade) fade.style.opacity = '1';
            if (chevron) chevron.style.transform = 'rotate(0deg)';
            card.dataset.expanded = '0';
        }
    });
}

async function updateHappyMembersStats() {
    const el = document.getElementById('happy-members-count');
    if (!el) return;

    // Önceki yüklemeden kalan değeri hemen göster (flicker önleme)
    const cached = localStorage.getItem('calith_member_count');
    if (cached) el.textContent = cached;

    const sb = getSupabase();
    if (!sb) return;

    try {
        const { data: userCount, error } = await sb.rpc('get_profile_count');

        if (!error) {
            const total = (userCount || 0) + 500;
            const finalValue = total.toLocaleString();
            el.textContent = finalValue;
            localStorage.setItem('calith_member_count', finalValue); // Bir sonraki açılış için hafızaya al
        }
    } catch (e) {
        console.error('Happy Members update failed:', e);
    }
}

// --- LINKS LOGIC (links.html) ---
let userLinks = [];

async function loadLinks() {
    const sb = getSupabase();
    if (!sb) return;

    try {
        const { data, error } = await sb.from('links').select('*').order('order_index', { ascending: true });
        if (!error && data) {
            userLinks = data;
            const isAdmin = window.location.pathname.includes('admin.html');
            if (isAdmin) renderAdminLinks();
            if (document.getElementById('dynamic-links-container')) renderFrontendLinks();
        }
    } catch (e) {
        console.warn("Links table may not exist yet.");
    }
}

async function saveLink() {
    const id = document.getElementById('link-edit-id').value;
    const title = document.getElementById('link-title').value.trim();
    const subtitle = document.getElementById('link-subtitle').value.trim();
    const url = document.getElementById('link-url').value.trim();
    const icon_type = document.getElementById('link-icon-type').value;
    const icon_name = document.getElementById('link-icon-name').value.trim();
    const category = document.getElementById('link-category').value;
    const order_index = parseInt(document.getElementById('link-order').value) || 0;

    if (!title) return alert('Başlık gereklidir!');

    const linkData = { title, subtitle, url, icon_type, icon_name, category, order_index };
    const sb = getSupabase();
    if (!sb) return;

    let result;
    if (id) {
        result = await sb.from('links').update(linkData).eq('id', id);
    } else {
        result = await sb.from('links').insert([linkData]);
    }

    if (result.error) {
        alert('Hata: ' + result.error.message);
    } else {
        showToast(id ? 'Link güncellendi' : 'Link eklendi');
        resetLinkForm();
        await loadLinks();
    }
}

function renderAdminLinks() {
    const list = document.getElementById('admin-link-list');
    if (!list) return;

    if (!userLinks || userLinks.length === 0) {
        list.innerHTML = '<div class="py-12 text-center text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10 italic">Henüz dinamik link eklenmemiş. "Varsayılanları Yükle" ile başlayabilirsiniz.</div>';
        return;
    }

    list.innerHTML = userLinks.map(l => `
        <div class="bg-calith-dark/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-calith-orange/30 transition-all">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-calith-orange">
                    ${l.icon_type === 'lucide' ? `<i data-lucide="${l.icon_name || 'link'}" class="w-5 h-5"></i>` : `<i class="fa-brands fa-${l.icon_name || 'link'} text-xl"></i>`}
                </div>
                <div>
                    <h4 class="font-bold text-sm text-white">${l.title}</h4>
                    <p class="text-[10px] text-gray-500 uppercase tracking-widest">${l.category} • Sıra: ${l.order_index}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="editLink('${l.id}')" class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-calith-orange rounded-xl transition-all"><i data-lucide="edit-2" class="w-4 h-4 text-white"></i></button>
                <button onclick="deleteLink('${l.id}')" class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-red-500 rounded-xl transition-all"><i data-lucide="trash-2" class="w-4 h-4 text-white"></i></button>
            </div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

function editLink(id) {
    const l = userLinks.find(x => x.id === id);
    if (!l) return;
    document.getElementById('link-edit-id').value = l.id;
    document.getElementById('link-title').value = l.title;
    document.getElementById('link-subtitle').value = l.subtitle || '';
    document.getElementById('link-url').value = l.url || '';
    document.getElementById('link-icon-type').value = l.icon_type || 'lucide';
    document.getElementById('link-icon-name').value = l.icon_name || '';
    document.getElementById('link-category').value = l.category || 'standard';
    document.getElementById('link-order').value = l.order_index || 0;
    updateIconPreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteLink(id) {
    if (!confirm('Bu linki silmek istediğinize emin misiniz?')) return;
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb.from('links').delete().eq('id', id);
    if (!error) {
        showToast('Link silindi');
        await loadLinks();
    }
}

function resetLinkForm() {
    document.getElementById('link-edit-id').value = '';
    document.getElementById('link-title').value = '';
    document.getElementById('link-subtitle').value = '';
    document.getElementById('link-url').value = '';
    document.getElementById('link-icon-type').value = 'lucide';
    document.getElementById('link-icon-name').value = '';
    document.getElementById('link-category').value = 'standard';
    document.getElementById('link-order').value = 0;
    updateIconPreview();
}

async function importLinkDefaults() {
    const sb = getSupabase();
    if (!sb) return;
    if (!confirm('Varsayılan linkleri (YouTube, Instagram, Website vb.) yüklemek istiyor musunuz?')) return;

    const defaults = [
        { title: 'Resmi Website', subtitle: 'Programlar & Eğitimler', url: 'index.html', icon_type: 'lucide', icon_name: 'globe', category: 'standard', order_index: 0 },
        { title: 'YouTube', subtitle: 'Kanalı Seç', url: '#', icon_type: 'fa', icon_name: 'youtube', category: 'youtube_modal', order_index: 1 },
        { title: 'Instagram', subtitle: 'Günlük Motivasyon & Tüyolar', url: '#', icon_type: 'fa', icon_name: 'instagram', category: 'standard', order_index: 2 },
        { title: 'TikTok', subtitle: 'Kısa Form Videolar', url: '#', icon_type: 'fa', icon_name: 'tiktok', category: 'standard', order_index: 3 },
        { title: 'Twitter', subtitle: 'Bilgi Selileri', url: '#', icon_type: 'fa', icon_name: 'twitter', category: 'standard', order_index: 4 },
        { title: 'Mağaza', subtitle: 'Calisthenics Ekipmanları', url: 'shop.html', icon_type: 'lucide', icon_name: 'shopping-cart', category: 'standard', order_index: 5 },
        { title: 'Rehberi İndir', subtitle: 'Ücretsiz programı hemen e-postana gönderelim.', url: '#', icon_type: 'lucide', icon_name: 'mail', category: 'newsletter', order_index: 6 }
    ];

    const { error } = await sb.from('links').insert(defaults);
    if (error) {
        alert('Hata: ' + error.message + '\nLütfen "links" tablosunu veritabanında oluşturduğunuzdan emin olun.');
    } else {
        showToast('Varsayılanlar başarıyla yüklendi');
        await loadLinks();
    }
}

function renderFrontendLinks() {
    const container = document.getElementById('dynamic-links-container');
    if (!container) return;

    if (!userLinks || userLinks.length === 0) {
        container.innerHTML = '<div class="text-gray-500 py-10 opacity-50 italic">Dinamik içerik henüz yüklenmedi.</div>';
        return;
    }

    // 1. YouTube Modal İndeksini Doldur (Eğer varsa)
    const ytModalList = document.getElementById('youtube-modal-list');
    if (ytModalList) {
        const ytItems = userLinks.filter(l => l.category === 'youtube_item');
        ytModalList.innerHTML = ytItems.map(l => `
            <a href="${l.url}" target="_blank" class="bg-black border border-white/10 hover:border-[#FF0000] rounded-2xl p-4 flex flex-col items-center transition-all group">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(l.title)}&background=random" alt="${l.title}" class="w-12 h-12 rounded-full mb-2 border border-white/5">
                <span class="font-bold text-sm text-white group-hover:text-[#FF0000] transition-colors">${l.title}</span>
            </a>
        `).join('');
    }

    // 2. Ana listeyi oluştur (youtube_item olmayanlar)
    const mainLinks = userLinks.filter(l => l.category !== 'youtube_item');
    container.innerHTML = mainLinks.map(l => {
        if (l.category === 'newsletter') {
            return `
                <div class="w-full max-w-xl mt-8 glass-card rounded-3xl p-6 text-center border-white/10 relative overflow-hidden group">
                    <div class="absolute inset-0 bg-gradient-to-br from-calith-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div class="relative z-10">
                        <i data-lucide="mail" class="w-8 h-8 text-calith-orange mx-auto mb-3"></i>
                        <h3 class="font-bold text-lg mb-2">${l.title}</h3>
                        <p class="text-sm text-gray-400 mb-4 px-4">${l.subtitle}</p>
                        <form class="flex max-w-sm mx-auto gap-2" onsubmit="event.preventDefault(); alert('Katılımınız alındı!');">
                            <input type="email" placeholder="E-Posta" required class="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-calith-orange transition-colors">
                            <button type="submit" class="bg-calith-orange text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors">Gönder</button>
                        </form>
                    </div>
                </div>
            `;
        }

        const onClick = l.category === 'youtube_modal' 
            ? "document.getElementById('youtube-modal').classList.remove('hidden')" 
            : `window.open('${l.url}', '${l.url.includes('.html') ? '_self' : '_blank'}')`;
        
        const iconHtml = l.icon_type === 'lucide' 
            ? `<i data-lucide="${l.icon_name || 'link'}" class="w-6 h-6 text-white"></i>` 
            : `<i class="fa-brands fa-${l.icon_name || 'link'} text-2xl text-white"></i>`;

        return `
            <div onclick="${onClick}" class="link-item w-full max-w-xl glass-card rounded-2xl p-4 flex items-center justify-between group cursor-pointer transition-all hover:scale-[1.02]">
                <div class="flex items-center gap-4 text-left">
                    <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-calith-orange/20 group-hover:border-calith-orange/50 transition-all">
                        ${iconHtml}
                    </div>
                    <div>
                        <h2 class="font-bold text-white text-lg tracking-wide group-hover:text-calith-orange transition-colors">${l.title}</h2>
                        <p class="text-xs text-gray-500">${l.subtitle}</p>
                    </div>
                </div>
                <i data-lucide="chevron-right" class="w-5 h-5 text-gray-500 group-hover:text-white transform group-hover:translate-x-1 transition-all"></i>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

// --- WORKOUT ENGINE FUNCTIONS ---

let myProgramIds = []; // Global sahiplik listesi

function isProgramAdded(programId) {
    // 1. Önce global sahiplik listesine bak (Supabase'den dolan)
    if (myProgramIds.includes(String(programId))) return true;
    
    // 2. localStorage'a bak (Eski veriler veya yedek için)
    const userProgs = JSON.parse(localStorage.getItem('calith_my_programs') || '[]');
    return userProgs.some(id => String(id) === String(programId));
}

async function startWorkoutMode(programId, dayIndex = 0) {
    // Hem programPosts içinde hem de tüm posts içinde ara (sayfa farketmeksizin)
    const p = posts.find(item => String(item.id) === String(programId));
    if (!p) return showToast('Program verisi bulunamadı.');

    // Program içeriğini parse et
    let days = [];
    try {
        const data = JSON.parse(p.content);
        days = Array.isArray(data) ? data : (data.days || []);
    } catch (e) {
        showToast('Bu program eski formatta, antrenman modu desteklenmiyor.');
        return;
    }

    if (days.length === 0) return showToast('Antrenman günü bulunamadı.');

    // Seçilen günü al (Eğer geçerli değilse 1. günü al)
    if (dayIndex >= days.length || dayIndex < 0) dayIndex = 0;
    const day = days[dayIndex]; 
    const exercises = (day.exercises || []).map(ex => {
        if (typeof ex === 'object') {
            return {
                name: ex.name,
                target: `${ex.sets} x ${ex.reps}${ex.type === 'secs' ? 'sn' : ''}`,
                targetSets: parseInt(ex.sets) || 1,
                targetReps: parseInt(ex.reps) || 10,
                type: ex.type || 'reps',
                sets: []
            };
        }
        
        // Eski format fallback
        const parts = String(ex).split('(');
        const name = parts[0].trim();
        let target = '4 x 12';
        if (parts[1]) target = parts[1].replace(')', '').trim();
        
        return { 
            name, 
            target, 
            targetSets: target.includes('x') ? parseInt(target.split('x')[0]) : 4,
            targetReps: target.includes('x') ? parseInt(target.split('x')[1]) : 12,
            type: 'reps',
            sets: [] 
        };
    });

    if (exercises.length === 0) return showToast('Bu gün için egzersiz tanımlanmamış.');

    // State Hazırla
    workoutSession = {
        active: true,
        program: p,
        dayName: day.name || 'GÜN 1',
        startTime: Date.now(),
        exercises: exercises,
        currExerciseIdx: 0,
        currSet: 1,
        history: []
    };

    // UI Hazırla
    document.getElementById('workout-mode').classList.remove('hidden');
    document.getElementById('workout-program-title').textContent = p.title.toUpperCase();
    document.getElementById('workout-rest-timer-box').classList.add('hidden');
    
    updateWorkoutUI();
    startWorkoutClock();
    
    showToast('Antrenman Başladı! Başarılar kanka.');
    if (window.lucide) lucide.createIcons();
}

function showNextExerciseModal() {
    // Varsa eskiyi temizle
    const oldModal = document.getElementById('next-exercise-modal');
    if (oldModal) oldModal.remove();

    const ex = workoutSession.exercises[workoutSession.currExerciseIdx];
    const isLast = workoutSession.currExerciseIdx === workoutSession.exercises.length - 1;

    const modalHtml = `
        <div id="next-exercise-modal" class="fixed inset-0 z-[9999] flex items-center justify-center px-4" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(20px);">
            <div class="relative bg-calith-dark w-full max-w-sm rounded-[2.5rem] p-8 text-center animate-in zoom-in duration-300" style="border: 2px solid #ff6b00; box-shadow: 0 0 50px rgba(255,107,0,0.2);">
                <div class="w-24 h-24 bg-calith-orange/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-calith-orange/10">
                    <i data-lucide="award" class="w-12 h-12" style="color: #ff6b00 !important;"></i>
                </div>
                <h3 class="font-display text-4xl font-black text-white mb-2 tracking-tighter italic">TEBRİKLER!</h3>
                <p class="text-xs font-black uppercase tracking-[0.2em] mb-8" style="color: #ff6b00 !important;">HEDEF SETLER TAMAMLANDI</p>
                
                <div class="space-y-4">
                    <button onclick="closeNextModal(); nextExercise();" class="w-full font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm active:scale-95 group" style="background: #ff6b00 !important; color: white !important; box-shadow: 0 10px 20px rgba(255,107,0,0.3) !important;">
                        <span>${isLast ? 'ANTRENMANI BİTİR' : 'SIRADAKİ HAREKETE GEÇ'}</span>
                        <i data-lucide="arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform"></i>
                    </button>
                    <button onclick="closeNextModal()" class="w-full bg-white/5 hover:bg-white/10 text-gray-500 font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px] border border-white/5">
                        Setlere Devam Et
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) lucide.createIcons();
}

function closeNextModal() {
    const modal = document.getElementById('next-exercise-modal');
    if (modal) {
        modal.classList.add('animate-out', 'fade-out', 'zoom-out', 'duration-300');
        setTimeout(() => modal.remove(), 300);
    }
}

function updateWorkoutUI() {
    const ex = workoutSession.exercises[workoutSession.currExerciseIdx];
    if (!ex) return finishWorkout();

    // Elementleri bul
    const nameEl = document.getElementById('workout-exercise-name');
    const targetEl = document.getElementById('workout-exercise-target');
    const moveInfoEl = document.getElementById('workout-move-info');
    const setInfoEl = document.getElementById('workout-set-info');
    const progTitleEl = document.getElementById('workout-program-title');
    const progressBar = document.getElementById('workout-progress-bar');
    const weightInput = document.getElementById('workout-input-weight');
    const repsInput = document.getElementById('workout-input-reps');

    // Metinleri Güncelle
    if (nameEl) nameEl.textContent = ex.name.toUpperCase();
    if (targetEl) targetEl.textContent = ex.target;
    if (progTitleEl) progTitleEl.textContent = workoutSession.programTitle || 'CALITH ANTRENMAN';
    if (moveInfoEl) moveInfoEl.textContent = `${workoutSession.currExerciseIdx + 1} / ${workoutSession.exercises.length}`;
    if (setInfoEl) setInfoEl.textContent = `SET ${workoutSession.currSet}`;

    // Akıllı Tekrar Çekme (Aşırı Güvenli Regex)
    if (repsInput) {
        let targetReps = 10;
        const targetStr = String(ex.target).toLowerCase();
        
        const xMatch = targetStr.match(/x\s*(\d+)/);
        if (xMatch) {
            targetReps = parseInt(xMatch[1], 10);
        } else {
            const numMatch = targetStr.match(/(\d+)/);
            if (numMatch) targetReps = parseInt(numMatch[1], 10);
        }
        
        repsInput.value = Math.max(1, targetReps || 10);
        
        // HTML min attribute (Scroll ile eksiye düşmemesi için)
        repsInput.setAttribute("min", "0");
        if (weightInput) weightInput.setAttribute("min", "0");
    }

    // Progres Bar
    if (progressBar) {
        const progress = (workoutSession.currExerciseIdx / workoutSession.exercises.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    renderWorkoutSets();
}

function renderWorkoutSets() {
    const container = document.getElementById('workout-sets-list');
    const ex = workoutSession.exercises[workoutSession.currExerciseIdx];
    if (!container || !ex) return;
    
    if (ex.sets.length === 0) {
        container.innerHTML = `
            <div class="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <p class="text-xs text-gray-600 font-bold uppercase tracking-widest">Henüz set girilmedi</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = ex.sets.map((set, i) => `
        <div class="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse" style="animation: fade-in 0.3s ease-out forwards;">
            <div class="flex items-center gap-3">
                <span class="text-[9px] font-black text-gray-600 uppercase tracking-widest">${i + 1}. SET</span>
                <div class="h-4 w-px bg-white/5"></div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                    <i data-lucide="weight" class="w-3.5 h-3.5 text-gray-500"></i>
                    <span class="text-sm font-mono font-bold text-white">${set.weight}kg</span>
                </div>
                <div class="flex items-center gap-2 bg-calith-orange/10 px-3 py-1 rounded-lg border border-calith-orange/20">
                    <i data-lucide="zap" class="w-3.5 h-3.5 text-calith-orange"></i>
                    <span class="text-sm font-mono font-bold text-calith-orange">${set.reps}</span>
                </div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function completeSet() {
    const weight = parseFloat(document.getElementById('workout-input-weight').value) || 0;
    const reps = parseInt(document.getElementById('workout-input-reps').value) || 0;

    if (reps === 0) return showToast('Lütfen tekrar sayısını girin.');

    const ex = workoutSession.exercises[workoutSession.currExerciseIdx];
    ex.sets.push({ weight, reps });

    // Dinlenme Başlat (Varsayılan 60 sn)
    startRestTimer(60);
    
    // UI Güncelle
    renderWorkoutSets();
    
    // Hedef set kontrolü (AŞIRI ZIRHLI VERSİYON)
    let targetSets = parseInt(ex.targetSets);
    if (isNaN(targetSets) || targetSets <= 0) {
        const match = String(ex.target).match(/(\d+)\s*[xX-]/);
        targetSets = match ? parseInt(match[1]) : 4;
    }

    console.log(`[Calith Debug] SET: ${workoutSession.currSet}, HEDEF: ${targetSets}`);

    if (workoutSession.currSet === targetSets) {
        console.log('[Calith Debug] Hedef Tamam! Modal ve Alert tetikleniyor...');
        showNextExerciseModal();
        // Fallback Alert (Modal açılmazsa diye garanti)
        setTimeout(() => {
            if (!document.getElementById('next-exercise-modal')) {
                alert("🔥 HAREKETİ TAMAMLADIN! Sıradaki harekete geçebilirsin.");
            }
        }, 500);
    } else if (workoutSession.currSet > targetSets) {
        showToast(`🔥 Limitleri zorluyorsun! (${workoutSession.currSet}. Set)`);
    } else {
        showToast(`${workoutSession.currSet}. Set Tamamlandı!`);
    }

    workoutSession.currSet++;
    document.getElementById('workout-set-info').textContent = `SET ${workoutSession.currSet}`;
}

function startRestTimer(seconds) {
    clearInterval(restInterval);
    const box = document.getElementById('workout-rest-timer-box');
    const clock = document.getElementById('workout-rest-clock');
    box.classList.remove('hidden');

    let timeLeft = seconds;
    restInterval = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        clock.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(restInterval);
            box.classList.add('hidden');
            showToast('Dinlenme bitti, sıradaki set!');
            // Ses eklenebilir
        }
    }, 1000);
}

function skipRest() {
    clearInterval(restInterval);
    document.getElementById('workout-rest-timer-box').classList.add('hidden');
}

function nextExercise() {
    workoutSession.currExerciseIdx++;
    workoutSession.currSet = 1;
    
    if (workoutSession.currExerciseIdx >= workoutSession.exercises.length) {
        finishWorkout();
    } else {
        updateWorkoutUI();
        skipRest();
    }
}

function startWorkoutClock() {
    clearInterval(workoutInterval);
    const timerEl = document.getElementById('workout-timer');
    workoutInterval = setInterval(() => {
        const diff = Date.now() - workoutSession.startTime;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        timerEl.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, 1000);
}

function confirmExitWorkout() {
    if (confirm('Antrenmanı bitirmeden çıkmak istediğine emin misin? Verilerin kaydedilmeyecek.')) {
        closeWorkoutMode();
    }
}

function closeWorkoutMode() {
    workoutSession.active = false;
    clearInterval(workoutInterval);
    clearInterval(restInterval);
    document.getElementById('workout-mode').classList.add('hidden');
}

async function finishWorkout() {
    showToast('Antrenman Tamamlandı! Veriler senkronize ediliyor...');
    
    // Veriyi hazırla
    const logData = {
        user_id: currentUser?.id,
        program_title: workoutSession.program.title,
        day_name: workoutSession.dayName,
        duration: document.getElementById('workout-timer').textContent,
        workout_data: {
            exercises: workoutSession.exercises.map(ex => ({
                name: ex.name,
                target: ex.target,
                sets: ex.sets
            }))
        }
    };

    // 1. Local-First: Her durumda tarayıcıya yedekle
    const localLogs = JSON.parse(localStorage.getItem('calith_workout_logs') || '[]');
    localLogs.push({ ...logData, date: new Date().toISOString() });
    localStorage.setItem('calith_workout_logs', JSON.stringify(localLogs));

    // 2. Supabase Sync: Eğer giriş yapılmışsa buluta gönder
    if (currentUser) {
        const sb = getSupabase();
        if (sb) {
            const { error } = await sb.from('workout_logs').insert([logData]);
            if (error) {
                console.error('Supabase Sync Error:', error);
                showToast('Bulut senkronizasyonu başarısız, yerel kaydedildi.');
            } else {
                showToast('Antrenman başarıyla buluta kaydedildi!');
            }
        }
    } else {
        showToast('Giriş yapılmadı, veriler sadece bu cihazda saklanacak.');
    }

    // UI'ı kapat ve ana sayfaya dön
    setTimeout(() => {
        closeWorkoutMode();
        // Eğer index.html'deysek landing'e, değilsek index'e yönlendir
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            showSection('landing');
        } else {
            window.location.href = 'index.html';
        }
    }, 2500);
}

function updateIconPreview() {
    const type = document.getElementById('link-icon-type').value;
    const name = document.getElementById('link-icon-name').value.trim().toLowerCase();
    const box = document.getElementById('icon-preview-box');
    if (!box) return;

    if (!name) {
        box.innerHTML = '';
        return;
    }

    if (type === 'lucide') {
        box.innerHTML = `<i data-lucide="${name}" class="w-5 h-5"></i>`;
        if (window.lucide) lucide.createIcons();
    } else {
        box.innerHTML = `<i class="fa-brands fa-${name} text-lg"></i>`;
    }
}

function setQuickIcon(type, name) {
    const typeEl = document.getElementById('link-icon-type');
    const nameEl = document.getElementById('link-icon-name');
    if (typeEl) typeEl.value = type;
    if (nameEl) nameEl.value = name;
    updateIconPreview();
}
