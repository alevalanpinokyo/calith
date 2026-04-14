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
}
let cart = JSON.parse(localStorage.getItem('calith_cart')) || [];
let currentPd = null;
let currentBlogId = null;
let pdQty = 1;
let isAdminMode = false;

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
                ${p.oldPrice ? `<span class="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">-%${Math.round((1-p.price / p.oldPrice) * 100)}</span>` : ''}
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
    
    list.innerHTML = filtered.map(p => `
        <article onclick="window.location.href='blog.html?b=${p.id}'" class="product-card group cursor-pointer rounded-3xl overflow-hidden card-hover">
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
    
    let mediaHtml = '';
    if (videoUrl) {
        let embedUrl = videoUrl;
        
        // Eğer kullanıcı direkt embed (iframe) kodu yapıştırdıysa içindeki src'yi çekelim
        const iframeMatch = videoUrl.match(/src=["'](.*?)["']/);
        if (iframeMatch) {
            embedUrl = iframeMatch[1];
        }

        if(embedUrl.includes('youtube.com/watch?v=')) {
            embedUrl = embedUrl.replace('watch?v=', 'embed/').split('&')[0];
        } else if(embedUrl.includes('youtu.be/')) {
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

async function savePost() {
    const title = document.getElementById('post-title').value;
    let content = document.getElementById('editor').innerHTML;
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

function init() {
    loadPosts();
    loadProducts(); // Dinamik ürünleri yükle
    updateCartUI();
    
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
    }

    // Scroll reveal observe
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal, .fade-in').forEach(el => observer.observe(el));

    // Lucide support
    if (window.lucide) lucide.createIcons();
    
    // Check URL for blog post detail
    const params = new URLSearchParams(window.location.search);
    const blogId = params.get('b');
}

// ============================================
// PROGRAM YÖNETİMİ FONKSİYONLARI (ADMIN)
// ============================================
async function saveProgram() {
    const title = document.getElementById('prog-title').value;
    let content = document.getElementById('prog-editor').innerHTML;
    const category = document.getElementById('prog-category').value;
    const image = document.getElementById('prog-cover').value;
    const video = document.getElementById('prog-video').value;
    const editId = document.getElementById('prog-edit-id').value;
    
    if (!title) return alert('Başlık gerekli!');

    content = content.replace(/<!-- VIDEO: (.*?) -->/g, ''); 
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

    let displayContent = p.content || '';
    let videoMatch = displayContent.match(/<!-- VIDEO: (.*?) -->/);
    let videoUrl = videoMatch ? videoMatch[1] : '';
    displayContent = displayContent.replace(/<!-- VIDEO: (.*?) -->/g, '');

    document.getElementById('prog-edit-id').value = p.id;
    document.getElementById('prog-title').value = p.title;
    document.getElementById('prog-category').value = p.category;
    document.getElementById('prog-cover').value = p.image || '';
    document.getElementById('prog-video').value = videoUrl;
    document.getElementById('prog-editor').innerHTML = displayContent;
    
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
    document.getElementById('prog-editor').innerHTML = '';
}

// ============================================
// PROGRAM GÖSTERİM FONKSİYONLARI (SKILLS.HTML)
// ============================================
function showProgramLevel(level, titleStr) {
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
    
    const levelPrograms = programPosts.filter(p => p.category === 'program_' + level);
    
    if (levelPrograms.length === 0) {
        grid.innerHTML = '<div class="col-span-3 text-center py-20 text-gray-400">Bu seviyede henüz program bulunmuyor.</div>';
        return;
    }

    grid.innerHTML = levelPrograms.map(p => `
        <article onclick="showProgramDetail('${p.id}')" class="product-card group cursor-pointer rounded-3xl overflow-hidden card-hover border border-white/5 bg-calith-dark/50">
            <div class="aspect-video relative overflow-hidden">
                <img src="${p.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-calith-dark via-transparent to-transparent opacity-80"></div>
            </div>
            <div class="p-6">
                <h3 class="font-display text-2xl font-bold mb-3 group-hover:text-calith-orange transition-colors">${p.title}</h3>
                <p class="text-gray-400 text-sm line-clamp-2 mb-6">${p.excerpt}</p>
                <div class="flex items-center gap-2 text-sm font-bold text-calith-orange opacity-0 group-hover:opacity-100 transition-all">
                    BAŞLA <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </div>
            </div>
        </article>
    `).join('');
    
    if (window.lucide) lucide.createIcons();
    window.scrollTo(0,0);
}

function showProgramDetail(id) {
    const listSec = document.getElementById('program-list-view');
    const detailSec = document.getElementById('blog-detail');
    
    if (listSec) listSec.classList.add('hidden');
    if (detailSec) detailSec.classList.remove('hidden');

    const p = programPosts.find(post => String(post.id) === String(id));
    if (!p) return;

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
        if(embedUrl.includes('watch?v=')) embedUrl = embedUrl.replace('watch?v=', 'embed/').split('&')[0];
        else if(embedUrl.includes('youtu.be/')) embedUrl = embedUrl.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0];

        mediaHtml = `<div class="w-full aspect-video rounded-2xl mb-12 overflow-hidden shadow-2xl border border-white/10">
            <iframe src="${embedUrl}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
        </div>`;
    } else if (p.image) {
        mediaHtml = `<img src="${p.image}" class="w-full aspect-video object-cover rounded-2xl mb-12 grayscale hover:grayscale-0 transition-all duration-700">`;
    }

    contentDiv.innerHTML = `
        <div class="mb-8">
            <h1 class="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">${p.title}</h1>
        </div>
        ${mediaHtml}
        <div class="prose prose-invert prose-lg max-w-none">
            ${displayContent}
        </div>
    `;
    window.scrollTo(0,0);
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
        return;
    }
    
    try {
        const { data, error } = await sb.from('announcements').select('*').order('created_at', { ascending: false });
        if (error || !data || data.length === 0) {
            announcements = defaultAnnouncements;
            if (error) console.warn("Supabase duyuru tablosu hazır değil. Varsayılanlar devrede.");
        } else {
            announcements = data;
        }
    } catch(e) {
        announcements = defaultAnnouncements;
    }
    
    if (document.getElementById('admin-ann-list')) renderAdminAnnouncements();
    if (document.getElementById('hero-slider-track')) renderAnnouncementsSlider();
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
            mediaHtml = `<div class="${isYoutube ? 'w-full max-w-[280px] aspect-video' : 'w-16 h-16'} rounded-2xl mb-5 flex-shrink-0 shadow-[0_0_30px_${hShadow}] group-hover:scale-105 transition-all border border-white/10 overflow-hidden bg-black/50 relative mx-auto">
                <img src="${imageUrl}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Media">
                ${isYoutube ? `
                <div class="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all flex items-center justify-center">
                    <div class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] group-hover:scale-110 group-hover:bg-calith-orange group-hover:text-black transition-all border border-white/30 text-white">
                        <i data-lucide="play" class="w-5 h-5 ml-1"></i>
                    </div>
                </div>
                ` : ''}
            </div>`;
        } else {
            mediaHtml = `<div class="w-20 h-20 rounded-2xl bg-${ann.color}/20 flex items-center justify-center text-${ann.color} mb-5 group-hover:scale-110 group-hover:bg-${ann.color} group-hover:text-white transition-all shadow-[0_0_20px_${hShadow}] flex-shrink-0 relative mx-auto">
                <i data-lucide="${ann.icon || 'bell'}" class="w-10 h-10"></i>
            </div>`;
        }

        return `
        <div class="flex-shrink-0 h-full p-6 flex flex-col items-center justify-center text-center cursor-pointer group" style="width: ${percentPerSlide}%" onclick="${onClickAction}">
            <div class="flex flex-col items-center justify-center w-full max-w-[320px] mx-auto">
                ${mediaHtml}
                <span class="text-[10px] uppercase font-bold tracking-widest text-${ann.color} mb-2 block mx-auto">${ann.label}</span>
                <h4 class="font-display text-2xl font-bold mb-3 group-hover:text-white text-gray-100 transition-colors leading-tight mx-auto">${ann.title}</h4>
                <p class="text-sm text-gray-400 leading-relaxed px-2 opacity-70 group-hover:opacity-100 transition-opacity text-center mx-auto">${ann.desc}</p>
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
    if(!videoId) return;
    
    // Eğer videoId bir YouTube ID'si değil de tam URL ise ID'yi ayıkla
    if(videoId.includes('http') || videoId.includes('youtube') || videoId.includes('youtu.be')) {
        const ytRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?/\s]{11})/i;
        const ytMatch = videoId.match(ytRegex);
        if(ytMatch) videoId = ytMatch[1];
        else {
            window.open(videoId, '_blank');
            return;
        }
    }

    const modal = document.getElementById('video-modal');
    const content = document.getElementById('video-modal-content');
    const container = document.getElementById('video-container');
    
    if(modal && container) {
        document.body.style.overflow = 'hidden';
        container.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.classList.add('opacity-100');
            if(content) {
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
    
    if(modal) {
        document.body.style.overflow = '';
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        if(content) {
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
        }
        
        setTimeout(() => {
            modal.classList.add('hidden');
            if(container) container.innerHTML = '';
        }, 300);
    }
}

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closeVideoModal();
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
    if(!confirm("Duyuruyu silmek istediğinize emin misiniz?")) return;
    
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
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// --- HOMECARDS LOGIC ---
let homecards = JSON.parse(localStorage.getItem('calith_homecards_cache')) || [];function toggleHomecardLinkFields() {
    const hiddenEl = document.getElementById('hc-section');
    const section = hiddenEl ? hiddenEl.value : 'hero';
    
    const equipmentBlock = document.getElementById('hc-fields-equipment');
    const descBlock = document.getElementById('hc-fields-desc');
    const iconBadgeBlock = document.getElementById('hc-fields-icon-badge');
    const linkBlock = document.getElementById('hc-fields-link');
    
    // İkon ve Rozet (Her ikisi de bir arada)
    if(iconBadgeBlock) {
        if(section === 'hero') {
            iconBadgeBlock.classList.add('hidden');
        } else {
            iconBadgeBlock.classList.remove('hidden');
        }
    }
    
    // Ekipman Özel Alanları vs Normal Açıklama
    if(descBlock && equipmentBlock) {
        if(section === 'equipment') {
            descBlock.classList.add('hidden');
            equipmentBlock.classList.remove('hidden');
        } else {
            descBlock.classList.remove('hidden');
            equipmentBlock.classList.add('hidden');
        }
    }

    // Buton ve Link Alanları
    if(linkBlock) {
        if(section === 'hero' || section === 'benefits') {
            linkBlock.classList.add('hidden');
        } else {
            linkBlock.classList.remove('hidden');
        }
    }
}

async function loadHomecards() {
    const sb = getSupabase();
    
    // Eğer önbellekte veri varsa ilk render'ı hemen yapalım (titremeyi önlemek için)
    if(homecards.length > 0 && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('admin.html'))) {
        if (typeof renderFrontendHomecards === 'function' && !window.location.pathname.endsWith('admin.html')) renderFrontendHomecards();
        if (typeof renderAdminHomecards === 'function' && window.location.pathname.endsWith('admin.html')) renderAdminHomecards();
    }

    if(!sb) return;
    const { data, error } = await sb.from('homecards').select('*');
    if(!error && data) {
        homecards = data;
        localStorage.setItem('calith_homecards_cache', JSON.stringify(data));
        
        if(typeof renderFrontendHomecards === 'function' && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
            renderFrontendHomecards();
        }
        if(typeof renderAdminHomecards === 'function' && window.location.pathname.endsWith('admin.html')) {
            renderAdminHomecards();
        }
    }
}

async function saveHomecard() {
    const section = document.getElementById('hc-section').value;
    const title = document.getElementById('hc-title').value.trim();
    if(!title) return alert('Başlık zorunludur!');

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
    if(!sb) return;

    let result;
    if(editId) {
        result = await sb.from('homecards').update(hcData).eq('id', editId);
    } else {
        // Yeni bir id oluştur
        const generatedId = section + '_' + Date.now();
        hcData.id = generatedId;
        result = await sb.from('homecards').insert([hcData]);
    }

    if(result.error) {
        alert('Hata: ' + result.error.message);
    } else {
        showToast(editId ? 'Ana Sayfa Kartı Güncellendi' : 'Yeni Kart Eklendi');
        resetHomecardForm();
        loadHomecards();
    }
}

async function importHomecardDefaults() {
    const sb = getSupabase();
    if(!sb) return alert('Supabase hazır değil.');
    if(!confirm('Ana sayfa için tüm varsayılan kartları (Hero, Kazançlar, Seviyeler, Program ve Aşamalar) yüklemek istediğinize emin misiniz?')) return;

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
    if(error) {
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
    if(typeof toggleHomecardLinkFields === 'function') toggleHomecardLinkFields();
}

function editHomecard(id) {
    const hc = homecards.find(x => x.id === id);
    if(!hc) return;

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
            const lowerLine = clean.toLowerCase();
            
            // Her satr sadece kendi anahtarnn verisini alsn (dier anahtarlar temizlensin)
            if(lowerLine.includes('ihtiyacın:') || lowerLine.includes('ihtiyaç:')) {
                let val = clean.split(':').slice(1).join(':').trim();
                // Eer iinde baka anahtar kelime kalmssa onu da kes
                val = val.split(/(Maliyet:|Neden:|İhtiyacın:|İhtiyaç:)/i)[0].trim();
                document.getElementById('hc-eq-needs').value = val;
            }
            else if(lowerLine.includes('maliyet:')) {
                let val = clean.split(':').slice(1).join(':').trim();
                val = val.split(/(Maliyet:|Neden:|İhtiyacın:|İhtiyaç:)/i)[0].trim();
                document.getElementById('hc-eq-cost').value = val;
            }
            else if(lowerLine.includes('neden:')) {
                let val = clean.split(':').slice(1).join(':').trim();
                val = val.split(/(Maliyet:|Neden:|İhtiyacın:|İhtiyaç:)/i)[0].trim();
                document.getElementById('hc-eq-reason').value = val;
            }
        });
    }

    document.getElementById('hc-link-text').value = hc.link_text || '';
    document.getElementById('hc-link-url').value = hc.link_url || '';
    if(typeof toggleHomecardLinkFields === 'function') toggleHomecardLinkFields();
    window.scrollTo({top: 0, behavior: 'smooth'});
}

async function deleteHomecard(id) {
    if(!confirm('Bu ana sayfa kartını silmek istediğinize emin misiniz?')) return;
    const sb = getSupabase();
    if(sb) {
        const { error } = await sb.from('homecards').delete().eq('id', id);
        if(!error) {
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
    if(!section || section === 'all') section = 'hero';
    currentHomecardFilter = section;
    
    const hiddenEl = document.getElementById('hc-section');
    const labelEl = document.getElementById('hc-section-label');
    if(hiddenEl) hiddenEl.value = section;
    if(labelEl) labelEl.textContent = hcSectionLabels[section] || 'BÖLÜM SEÇİLDİ';

    if(!skipReset) resetHomecardForm();
    if(typeof toggleHomecardLinkFields === 'function') toggleHomecardLinkFields();
    
    renderAdminHomecards();
    const btnIds = ['hero', 'benefits', 'levels', 'schedule', 'equipment'];
    btnIds.forEach(id => {
        const btn = document.getElementById('hc-filter-' + id);
        if(btn) {
            if(id === section) {
                btn.className = "text-xs font-bold uppercase py-2 px-4 rounded-lg bg-calith-orange text-white transition-colors";
            } else {
                btn.className = "text-xs font-bold uppercase py-2 px-4 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors";
            }
        }
    });
}

function renderAdminHomecards() {
    const list = document.getElementById('admin-hc-list');
    if(!list) return;

    if(!homecards || homecards.length === 0) {
        list.innerHTML = '<div class="text-gray-500 py-4 text-sm font-bold uppercase tracking-widest text-center">Kayıtlı ana sayfa kartı yok.</div>';
        return;
    }

    let filtered = homecards;
    if(currentHomecardFilter !== 'all') {
        filtered = homecards.filter(hc => hc.section === currentHomecardFilter);
    }
    
    if(filtered.length === 0) {
        list.innerHTML = '<div class="text-gray-500 py-4 text-sm font-bold uppercase tracking-widest text-center">Bu bölümde henüz kart yok.</div>';
        return;
    }

    list.innerHTML = filtered.map(hc => `
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
    if(window.lucide) lucide.createIcons();
}

function renderFrontendHomecards() {
    if(!homecards || homecards.length === 0) return;

    const hero = homecards.find(h => h.section === 'hero');
    if (hero) {
        const titleEl = document.getElementById('hero-title');
        const subEl = document.getElementById('hero-subtitle');
        if (titleEl) titleEl.innerHTML = hero.title;
        if (subEl) subEl.innerHTML = hero.desc_text;
    }

    const benefits = homecards.filter(h => h.section === 'benefits').sort((a,b)=> (a.id > b.id ? 1 : -1));
    if (benefits.length > 0) {
        const grid = document.getElementById('benefits-grid');
        if (grid) {
            grid.innerHTML = benefits.map((b, i) => `
                <div class="relative card-hover product-card rounded-3xl p-8 group cursor-pointer hover:border-calith-orange/30 transition-all flex flex-col items-start" onclick="this.classList.toggle('is-open'); this.querySelector('.chevron-icon')?.classList.toggle('rotate-180')">
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
        }
    }

    const levels = homecards.filter(h => h.section === 'levels').sort((a,b)=> (a.id > b.id ? 1 : -1));
    if (levels.length > 0) {
        const grid = document.getElementById('levels-grid');
        if (grid) {
            grid.innerHTML = levels.map((lvl, i) => {
                const isPop = lvl.badge ? true : false;
                const borderClass = isPop ? 'border-calith-orange/30 shadow-2xl shadow-calith-orange/5' : 'border-white/5';
                
                return `
                <div onclick="window.location.href='${lvl.link_url || 'skills.html'}'" class="bg-calith-dark/50 border ${borderClass} rounded-3xl p-8 flex flex-col hover:border-calith-orange/30 transition-all card-hover group cursor-pointer text-center relative">
                    ${isPop ? '<div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-calith-orange text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">'+lvl.badge+'</div>' : ''}
                    <div class="text-5xl mb-6">${lvl.icon || '🌱'}</div>
                    <h3 class="font-display text-2xl font-bold mb-2 uppercase">${lvl.title}</h3>
                    <div class="bg-black/30 rounded-2xl p-4 w-full mb-8 text-left border border-white/5">
                        <p class="text-sm text-gray-300 leading-relaxed whitespace-pre-line">${lvl.desc_text || ''}</p>
                    </div>
                    <div class="mt-auto">
                        <button class="w-full ${isPop ? 'btn-primary' : 'btn-outline border-white/10 group-hover:border-calith-orange group-hover:bg-calith-orange group-hover:text-white'} py-4 rounded-xl font-bold text-sm transition-all uppercase tracking-widest mb-3">Ben Buradayım</button>
                        <span class="text-xs ${isPop ? 'text-calith-orange' : 'text-gray-500'} font-bold uppercase tracking-widest group-hover:text-calith-orange transition-colors">→ ${lvl.link_text || 'İncele'}</span>
                    </div>
                </div>
                `;
            }).join('');
        }
    }

    const schedule = homecards.filter(h => h.section === 'schedule').sort((a,b)=> (a.id > b.id ? 1 : -1));
    if (schedule.length > 0) {
        const grid = document.getElementById('schedule-grid');
        if (grid) {
            grid.className = "grid lg:grid-cols-3 gap-6 fade-in";
            grid.innerHTML = schedule.map((sch, i) => {
                const colorMap = ['calith-orange', 'calith-accent', 'red-500', 'green-500'];
                const c = colorMap[i % colorMap.length];
                const listItems = (sch.desc_text || '').split(/\n|\\n/).filter(l => l.trim().length > 0).map(l => 
                    `<li class="flex items-start gap-3 pb-2.5 border-b border-white/[0.05] last:border-0"><span class="text-${c} shrink-0 mt-0.5 font-bold text-lg">✓</span><span class="text-gray-400 font-medium tracking-tight">${l.trim().replace(/^[-✓* ]+/, '')}</span></li>`
                ).join('');

                return `
                <div onclick="toggleScheduleCard()" class="program-card bg-calith-gray border border-white/5 rounded-[1.5rem] p-7 lg:p-8 hover:border-white/20 transition-all duration-500 group shadow-xl relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-${c}/5 blur-3xl rounded-full"></div>
                    <div class="flex flex-col w-full relative z-10">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-${c}/10 flex items-center justify-center font-display font-bold text-xl text-${c} shrink-0">${sch.icon || ('0' + (i+1))}</div>
                                <div>
                                    <h4 class="font-bold text-lg text-white tracking-tight uppercase">${sch.title}</h4>
                                    <span class="text-gray-500 font-bold text-[9px] uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">${sch.badge || ''}</span>
                                </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" class="chevron-icon w-5 h-5 text-gray-500 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        
                        <div class="program-list-container">
                            <ul class="text-sm space-y-3">
                                ${listItems}
                            </ul>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        }
    }
    const equipment = homecards.filter(h => h.section === 'equipment').sort((a,b)=> (a.id > b.id ? 1 : -1));
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
                    if(parts.length > 1) {
                        const key = parts[0].trim();
                        const val = parts.slice(1).join(':').trim();
                        if (val) blocks[key.toLowerCase()] = { key, val }; // Son gelen eskisinizerine yazar
                    } else {
                        infoLines.push(cleanLine);
                    }
                });

                let descHtml = '';
                // nce anahtar bloklar dzelim
                Object.values(blocks).forEach(block => {
                    const isMaliyet = block.key.toLowerCase().includes('maliyet');
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
                        ${eq.badge ? eq.badge.replace(/[^a-zA-Z0-9İıĞğÜüŞşÖöÇç ]/g, '').trim() : ('AŞAMA ' + (i+1))}
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
    if(modal) {
        modal.classList.remove('hidden');
        toggleAuthView('login'); // Default is login
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if(modal) modal.classList.add('hidden');
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
    if(!email || !pass) return showToast('Lütfen bilgileri girin.');

    const sb = getSupabase();
    if(!sb) return;

    const btnTxt = document.getElementById('btn-login-txt');
    if(btnTxt) btnTxt.textContent = 'Giriş Yapılıyor...';
    
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    
    if(btnTxt) btnTxt.textContent = 'Giriş Yap';

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

    if(!name || !email || !pass) return showToast('Lütfen tüm bilgileri girin!');
    if(pass.length < 6) return alert('Şifre en az 6 karakter olmalı');

    const sb = getSupabase();
    if(!sb) return;

    const btnTxt = document.getElementById('btn-reg-txt');
    if(btnTxt) btnTxt.textContent = 'Kayıt Olunuyor...';

    // Supabase Sign Up - Metadata dahil
    const { data, error } = await sb.auth.signUp({
        email,
        password: pass,
        options: {
            data: {
                full_name: name,
                fitness_level: level,
                role: 'user' // Default normal user role
            }
        }
    });

    if(btnTxt) btnTxt.textContent = 'Topluluğa Katıl';

    if (error) {
        alert('Kayıt Hatası: ' + error.message);
    } else {
        showToast('Kayıt başarılı! Aramıza hoş geldin.');
        currentUser = data.user;
        closeAuthModal();
        updateAuthUI();
    }
}

async function handleLogout() {
    const sb = getSupabase();
    if(sb) await sb.auth.signOut();
    currentUser = null;
    showToast('Çıkış yapıldı');
    updateAuthUI();
    
    // Yalnızca profil veya admin sayfasındayken çıkış yapılıyorsa anasayfaya yönlendir
    if (window.location.pathname.endsWith('profile.html') || window.location.pathname.endsWith('admin.html')) {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500); // Kullanıcı "Çıkış yapıldı" toast mesajını görebilsin diye ufak bir bekleme
    }
}

async function checkCurrentUser() {
    const sb = getSupabase();
    if(sb) {
        const { data: { session } } = await sb.auth.getSession();
        if(session) {
            currentUser = session.user;
        }
    }
    updateAuthUI();
}

function updateAuthUI() {
    // Desktop Nav Auth Button
    const deskBtns = document.querySelectorAll('button[onclick="showAuthModal()"], button[onclick="window.location.href=\'profile.html\'"], button[onclick="handleLogout()"]');
    deskBtns.forEach(btn => {
        // İndex sayfası desktop butonları genelde btn-outline içerir
        if(!btn.classList.contains('w-full') && btn.classList.contains('hidden')) {
            if(currentUser) {
                btn.textContent = 'Profilim';
                btn.setAttribute('onclick', "window.location.href='profile.html'");
                btn.classList.remove('text-red-400', 'border-red-500/30');
                btn.classList.add('text-white', 'btn-outline');
            } else {
                btn.textContent = 'Giriş Yap';
                btn.setAttribute('onclick', 'showAuthModal()');
                btn.classList.remove('text-red-400', 'border-red-500/30');
                btn.classList.add('text-white', 'btn-outline');
            }
        }
        
        // Mobile Header Icon Button
        if(btn.classList.contains('md:hidden') && btn.classList.contains('p-2')) {
            if(currentUser) {
                btn.setAttribute('onclick', "window.location.href='profile.html'");
                btn.classList.add('text-calith-accent');
                btn.classList.remove('text-white');
            } else {
                btn.setAttribute('onclick', 'showAuthModal()');
                btn.classList.add('text-white');
                btn.classList.remove('text-calith-accent');
            }
        }
    });

    // Mobile Menu Auth Button
    const mobileAuthBtn = document.querySelector('#mobile-menu button[onclick="showAuthModal()"], #mobile-menu button[onclick="window.location.href=\'profile.html\'"], #mobile-menu button[onclick="handleLogout()"]');
    if(mobileAuthBtn) {
        if(currentUser) {
            mobileAuthBtn.textContent = 'PROFİLİM';
            mobileAuthBtn.setAttribute('onclick', "window.location.href='profile.html'");
            mobileAuthBtn.classList.add('text-calith-accent');
            mobileAuthBtn.classList.remove('text-red-500', 'text-white');
        } else {
            mobileAuthBtn.textContent = 'GİRİŞ YAP / ÜYE OL';
            mobileAuthBtn.setAttribute('onclick', 'showAuthModal()');
            mobileAuthBtn.classList.remove('text-red-500', 'text-calith-accent');
            mobileAuthBtn.classList.add('text-white');
        }
    }
}

// --- LEAD OR EMAIL COLLECTION ---
async function submitLeadForm() {
    const emailEl = document.getElementById('lead-email');
    if(!emailEl) return;
    
    const email = emailEl.value.trim();
    if(!email) return showToast('Lütfen e-posta adresinizi girin.');
    if(!email.includes('@') || !email.includes('.')) return showToast('Lütfen geçerli bir e-posta girin.');

    const btn = document.getElementById('btn-lead-submit');
    const oldHtml = btn ? btn.innerHTML : 'Şimdi İndir';
    if(btn) btn.innerHTML = 'Kaydediliyor... <i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>';

    const sb = getSupabase();
    if(sb) {
        const { error } = await sb.from('leads').insert([{ email }]);
        if(error) {
            console.error('Lead error:', error);
            if(error.code === '23505') {
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
            if(modal) modal.classList.add('hidden');
            emailEl.value = '';
        }
    } else {
        showToast('Veritabanı bağlantısı bulunamadı.');
    }
    
    if(btn) {
        btn.innerHTML = oldHtml;
        if (window.lucide) lucide.createIcons();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initial page state & logic
    if (typeof init === 'function') init();
    checkCurrentUser();
    updateCartUI();

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
        logo.addEventListener('touchstart', (e) => { e.preventDefault(); startPress(e); }, {passive: false});
        logo.addEventListener('touchend', endPress);
    }

    // 4. Data Loading (Posts & Homecards)
    // Run these in parallel for speed
    const loadOps = [
        loadPosts().then(() => {
            if (window.location.pathname.includes('blog.html')) renderBlog();
            
            const params = new URLSearchParams(window.location.search);
            const productId = params.get('p');
            const blogId = params.get('b');
            const blogCat = params.get('c');
            const levelCode = params.get('level');

            if (productId) showProductDetail(productId);
            else if (blogId) showBlogDetail(blogId);
            else if (blogCat && window.location.pathname.includes('blog.html')) filterBlog(blogCat);
            else if (levelCode && window.location.pathname.includes('skills.html')) {
                const levelMap = { 'baslangic': 'Başlangıç', 'orta': 'Orta Seviye', 'ileri': 'İleri Seviye' };
                if (levelMap[levelCode]) setTimeout(() => showProgramLevel(levelCode, levelMap[levelCode]), 100);
            }
        }),
        (async () => {
            if(window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('admin.html')) {
                await loadAnnouncements();
                await loadHomecards();
            }
        })()
    ];

    await Promise.all(loadOps);

    // 5. Finishing Touches
    if (window.location.pathname.includes('shop.html')) renderShop();
    if (window.lucide) lucide.createIcons();
});

// PDF Export Logic (Cleaned for Printers)
function exportProgramPDF() {
    const printArea = document.getElementById('print-area');
    const printContent = document.getElementById('print-content');
    const scheduleGrid = document.getElementById('schedule-grid');
    
    if (printArea && printContent && scheduleGrid) {
        showToast('PDF Hazırlanıyor...');
        
        // Sadece gerekli kısımları al (temiz içerik)
        const cards = Array.from(scheduleGrid.querySelectorAll('.program-card'));
        
        printContent.innerHTML = cards.map(card => {
            const title = card.querySelector('h4').innerText;
            const subtitle = card.querySelector('span').innerText;
            const list = card.querySelector('ul').innerHTML;
            
            return `
            <div style="margin-bottom: 30px; border: 1px solid #000; padding: 20px; border-radius: 10px;">
                <h2 style="font-size: 20px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px;">${title} (${subtitle})</h2>
                <ul style="list-style: none; padding: 0;">${list}</ul>
            </div>
            `;
        }).join('');
        
        // Gereksiz "✓" sembollerini ve stil sınıflarını temizle
        const checkmarks = printContent.querySelectorAll('.text-red-500, .text-calith-orange');
        checkmarks.forEach(c => c.style.color = 'black');

        window.print();
    }
}


// Global Add to Programs Placeholder
function addToMyPrograms() {
    showToast('Program başarıyla kütüphanenize eklendi! (Gelecek Özellik)');
}

// Program Card Toggle (Preview + Expand)
function toggleScheduleCard() {
    const containers = document.querySelectorAll('#schedule-grid .program-list-container');
    const fades      = document.querySelectorAll('#schedule-grid .program-list-fade');
    const chevrons   = document.querySelectorAll('#schedule-grid .chevron-icon');
    const grid       = document.getElementById('schedule-grid');
    if (!grid) return;
    const isExpanded = grid.dataset.expanded === '1';
    containers.forEach(function(c) {
        c.style.transition = 'max-height 0.5s ease';
        c.style.maxHeight  = isExpanded ? '90px' : (c.scrollHeight + 40) + 'px';
    });
    fades.forEach(function(f) {
        f.style.opacity = isExpanded ? '1' : '0';
    });
    chevrons.forEach(function(ch) {
        ch.style.transition = 'transform 0.5s ease';
        ch.style.transform  = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
    });
    grid.dataset.expanded = isExpanded ? '0' : '1';
}

