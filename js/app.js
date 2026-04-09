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
    if (!sb) {
        console.warn('Supabase henüz hazır değil, varsayılan ürünler yükleniyor.');
        renderShop();
        return;
    }

    const { data, error } = await sb
        .from('products')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Supabase Ürünler hata:', error);
    } else if (data && data.length > 0) {
        products = data;
        localStorage.setItem('calith_products_fallback', JSON.stringify(data));
    }
    renderShop();
    renderAdminProducts();
}

const defaultPosts = [
    { id: 1, title: "Calisthenics'e Başlarken: Temel 5 Hareket", slug: "calisthenics-baslarken", category: "temel", excerpt: "Vücut ağırlığı eğitimine başlamak için bilmen gereken temel hareketler ve form ipuçları.", content: `<p>Calisthenics, sadece vücut ağırlığını kullanarak yapılan en etkili antrenman şekillerinden biridir. İşte başlaman için 5 temel hareket:</p><h2>1. Pull-Up (Barfiks)</h2><p>Sırt ve biceps kaslarını çalıştıran temel hareket. Barfiks barına asıl ve kendini yukarı çek.</p><h2>2. Push-Up (Şınav)</h2><p>Göğüs, omuz ve triceps için klasik hareket. Vücudun düz bir hat olsun.</p><h2>3. Bodyweight Squat</h2><p>Bacak ve kalça kasları için. Ayaklar omuz genişliğinde.</p><h2>4. Plank</h2><p>Core ve karın kasları için. Dirsekler omuz hizasında.</p><h2>5. Dips</h2><p>Paralel bar veya sandalye kenarında. Göğüs altı ve triceps için.</p>`, image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=800&auto=format&fit=crop", date: "2024-03-10" },
    { id: 2, title: "Evde Pull-Up Barı Kurulum Rehberi", slug: "evde-pull-up-bari-kurulum", category: "ekipman", excerpt: "Kapı barfiks barı nasıl kurulur? Duvara montaj ipuçları ve güvenlik önlemleri.", content: `<p>Kapı barfiks barı, evde calisthenics yapmanın en kolay yoludur.</p><h2>1. Kapı Seçimi</h2><p>Kapı kasası sağlam olmalı. Metal kasalar idealdir.</p><h2>2. Montaj</h2><p>Barı kapı kasasına yerleştir. Ayarlanabilir mekanizmayı sık.</p><h2>3. Güvenlik Testi</h2><p>Önce hafif ağırlıkla test et. 130kg taşıma kapasitesi var.</p>`, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop", date: "2024-03-15" },
    { id: 3, title: "Muscle-Up Teknik Rehberi", slug: "muscle-up-teknik", category: "ileri", excerpt: "Barfiksten muscle-up geçişi için detaylı teknik analiz ve egzersizler.", content: `<p>Muscle-up, calisthenics'in en etkileyici hareketlerinden biridir.</p><h2>Teknik Adımlar</h2><p>Kuvvetli bir pull-up ile başla, hızlan ve dirseklerini döndür.</p>`, image: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?q=80&w=800&auto=format&fit=crop", date: "2024-03-20" }
];

let posts = [];

async function loadPosts() {
    const sb = getSupabase();
    if (!sb) {
        posts = defaultPosts;
        renderLandingBlog();
        renderBlog();
        return;
    }

    const { data, error } = await sb
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

    if (error) {
        posts = defaultPosts;
    } else {
        posts = data.map(p => ({
            ...p,
            category: p.category || 'temel',
            image: p.image || 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=800&auto=format&fit=crop',
            date: (p.created_at || p.date || '').slice(0, 10)
        }));
    }
    renderLandingBlog();
    renderBlog();
}
let cart = JSON.parse(localStorage.getItem('calith_cart')) || [];
let currentPd = null;
let currentBlogId = null;
let pdQty = 1;
let isAdminMode = false;
const ADMIN_HASH = 'Y2FsaXRoMjAyNA==';

function showSection(section) {
    const target = document.getElementById(section);
    
    if (!target) {
        // Eğer bölüm bu sayfada yoksa, ilgili sayfaya yönlendir
        if (section === 'landing') window.location.href = 'index.html';
        else if (section === 'shop') window.location.href = 'shop.html';
        else if (section === 'blog') window.location.href = 'blog.html';
        else if (section === 'admin') window.location.href = 'admin.html';
        else if (section === 'product-detail' && currentPd) window.location.href = `shop.html?p=${currentPd.id}`;
        else if (section === 'blog-detail' && currentBlogId) window.location.href = `blog.html?b=${currentBlogId}`;
        return;
    }

    document.querySelectorAll('section').forEach(s => { s.classList.add('hidden'); s.classList.remove('active'); });
    target.classList.remove('hidden');
    setTimeout(() => target.classList.add('active'), 50);
    
    const nav = document.getElementById('global-nav');
    if (section === 'shop' || section === 'product-detail') {
        document.body.classList.remove('theme-dark'); document.body.classList.add('theme-light');
        if (nav) {
            nav.classList.add('bg-white/80', 'border-gray-200'); nav.classList.remove('bg-dark/80', 'border-primary');
        }
    } else {
        document.body.classList.remove('theme-light'); document.body.classList.add('theme-dark');
        if (nav) {
            nav.classList.remove('bg-white/80', 'border-gray-200'); nav.classList.add('bg-dark/80', 'border-primary');
        }
    }
    window.scrollTo(0, 0);
    if (section === 'landing') renderLandingBlog();
    if (section === 'shop') renderShop();
    if (section === 'blog') renderBlog();
}

function renderLandingBlog() {
    const container = document.getElementById('landing-blog-preview');
    if (!container) return;
    container.innerHTML = posts.slice(0, 3).map(p => `
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
    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
    grid.innerHTML = filtered.map(p => `
        <div onclick="showProductDetail(${p.id})" class="product-card group cursor-pointer rounded-3xl overflow-hidden card-hover">
            <div class="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-8 relative overflow-hidden">
                <img src="${p.image}" class="w-full h-full object-cover mix-blend-overlay opacity-50 group-hover:opacity-100 transition-opacity">
                ${p.badge ? `<span class="absolute top-4 left-4 bg-calith-orange text-white text-[10px] font-bold px-3 py-1 rounded-full">${p.badge}</span>` : ''}
                ${p.oldPrice ? `<span class="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">-%${Math.round((1-p.price/p.oldPrice)*100)}</span>` : ''}
            </div>
            <div class="p-6">
                <p class="text-[10px] text-calith-orange font-bold uppercase tracking-widest mb-1">${p.category}</p>
                <h3 class="font-display text-lg font-bold mb-3 group-hover:text-white transition-colors">${p.name}</h3>
                <div class="flex items-center justify-between">
                    <div class="flex items-baseline gap-2">
                        <span class="font-bold text-xl">${p.price}₺</span>
                        ${p.oldPrice ? `<span class="text-xs text-gray-500 line-through">${p.oldPrice}₺</span>` : ''}
                    </div>
                    <button onclick="event.stopPropagation(); addToCartById(${p.id})" class="w-10 h-10 bg-calith-orange/10 text-calith-orange rounded-full flex items-center justify-center hover:bg-calith-orange hover:text-white transition-all transform hover:rotate-90">
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
    currentPd = products.find(p => p.id === id);
    if (!currentPd) return;
    document.getElementById('pd-image').src = currentPd.image;
    document.getElementById('pd-category').textContent = currentPd.category;
    document.getElementById('pd-name').textContent = currentPd.name;
    document.getElementById('pd-price').textContent = currentPd.price + '₺';
    document.getElementById('pd-old-price').textContent = currentPd.oldPrice ? currentPd.oldPrice + '₺' : '';
    document.getElementById('pd-desc').textContent = currentPd.desc;
    pdQty = 1; document.getElementById('pd-qty').textContent = '1';
    showSection('product-detail');
}

function changePdQty(delta) { pdQty = Math.max(1, pdQty + delta); document.getElementById('pd-qty').textContent = pdQty; }

function addToCartFromDetail() { if (!currentPd) return; addToCart(currentPd, pdQty); showSection('shop'); }

function renderBlog(filter = 'all') {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;
    
    const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter);
    
    if (filtered.length === 0) { 
        grid.innerHTML = '<div class="col-span-3 text-center py-12 text-secondary">Henüz yazı yok.</div>'; 
        return; 
    }
    
    grid.innerHTML = filtered.map(p => `
        <article onclick="showBlogDetail('${p.id}')" class="blog-card group cursor-pointer bg-secondary border border-primary rounded-2xl overflow-hidden h-[450px] relative">
            <img src="${p.image}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
            <div class="absolute top-4 left-4 z-10">
                <span class="px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-full">${p.category}</span>
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-6 z-10 card-content">
                <div class="text-white/60 text-xs mb-2 uppercase tracking-wider">${p.date}</div>
                <h3 class="text-2xl font-black text-white mb-3 line-clamp-2 leading-tight group-hover:text-accent transition-colors">${p.title}</h3>
                <p class="text-white/70 text-sm line-clamp-3 mb-4">${p.excerpt}</p>
                <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-white flex items-center gap-2 group-hover:gap-3 transition-all">
                        DEVAMINI OKU <i class="fas fa-long-arrow-alt-right"></i>
                    </span>
                    <span class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <i class="fas fa-arrow-up transform rotate-45"></i>
                    </span>
                </div>
            </div>
        </article>
    `).join('');
}

function filterBlog(cat) {
    document.querySelectorAll('.blog-filter').forEach(b => {
        b.classList.remove('active', 'bg-white', 'text-black');
        if (b.dataset.filter === cat) b.classList.add('active', 'bg-white', 'text-black');
    });
    renderBlog(cat);
}

function showBlogDetail(id) {
    currentBlogId = id;
    const p = posts.find(post => post.id.toString() === id.toString());
    if (!p) return;
    const contentDiv = document.getElementById('blog-detail-content');
    
    if (!contentDiv) {
        window.location.href = `blog.html?b=${id}`;
        return;
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
        ${p.image ? `<img src="${p.image}" class="w-full aspect-video object-cover rounded-2xl mb-12 grayscale hover:grayscale-0 transition-all duration-700">` : ''}
        <div class="prose prose-invert prose-lg max-w-none">
            ${p.content}
        </div>
        <div class="mt-12 pt-8 border-t border-primary">
            <h3 class="text-2xl font-bold mb-4">Benzer Yazılar</h3>
            <div class="grid md:grid-cols-2 gap-4">
                ${posts.filter(post => post.id.toString() !== p.id.toString()).slice(0, 2).map(post => `
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

function checkAdmin() {
    const pass = document.getElementById('admin-pass').value;
    if (btoa(pass) === ADMIN_HASH) {
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-editor').classList.remove('hidden');
        isAdminMode = true;
        localStorage.setItem('admin_token', 'true');
        showToast('Yönetici girişi başarılı');
        // Reset tabs to default visually
        if (typeof switchAdminTab === 'function') switchAdminTab('blog');
        if (window.lucide) lucide.createIcons();
    } else {
        alert('Hatalı şifre!');
    }
}

function logoutAdmin() { 
    document.getElementById('admin-login').classList.remove('hidden'); 
    document.getElementById('admin-editor').classList.add('hidden'); 
    document.getElementById('admin-pass').value = ''; 
    isAdminMode = false;
    showSection('blog'); 
}

// Logo'ya uzun basma olayı - DÜZELTİLMİŞ VERSİYON
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.getElementById('logo-container');
    let pressTimer;
    let isPressing = false;
    
    if (logo) {
        // Normal tıklama - Ana sayfaya git
        logo.addEventListener('click', (e) => {
            if (!isPressing) {
                window.location.href = 'index.html';
            }
        });

        // Mouse events
        logo.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isPressing = true;
            logo.style.transform = 'scale(0.95)';
            logo.style.transition = 'transform 0.2s ease';
            
            pressTimer = setTimeout(() => {
                if (isPressing) {
                    isPressing = false;
                    logo.style.transform = 'scale(1)';
                    showToast('Admin modu açılıyor...');
                    setTimeout(() => showAdmin(), 500);
                }
            }, 5000);
        });
        
        logo.addEventListener('mouseup', () => {
            isPressing = false;
            clearTimeout(pressTimer);
            logo.style.transform = 'scale(1)';
        });
        
        logo.addEventListener('mouseleave', () => {
            isPressing = false;
            clearTimeout(pressTimer);
            logo.style.transform = 'scale(1)';
        });
        
        // Touch events - Mobil için
        logo.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isPressing = true;
            logo.style.transform = 'scale(0.95)';
            logo.style.transition = 'transform 0.2s ease';
            
            pressTimer = setTimeout(() => {
                if (isPressing) {
                    isPressing = false;
                    logo.style.transform = 'scale(1)';
                    showToast('Admin modu açılıyor...');
                    setTimeout(() => showAdmin(), 500);
                }
            }, 5000);
        });
        
        logo.addEventListener('touchend', () => {
            isPressing = false;
            clearTimeout(pressTimer);
            logo.style.transform = 'scale(1)';
        });
        
        logo.addEventListener('touchcancel', () => {
            isPressing = false;
            clearTimeout(pressTimer);
            logo.style.transform = 'scale(1)';
        });
    }
    
    loadPosts().then(() => {
        // Eğer blog sayfasındaysak blogu tekrar render et (garanti olsun)
        if (window.location.pathname.includes('blog.html')) renderBlog();
        
        // URL parametrelerini kontrol et
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('p');
        const blogId = params.get('b');

        if (productId) {
            showProductDetail(productId);
        } else if (blogId) {
            showBlogDetail(blogId);
        }
    });
    
    // Eğer shop sayfasındaysak dükkanı render et
    if (window.location.pathname.includes('shop.html')) renderShop();
    
    updateCartUI();

    // Aktif menü öğesini vurgula
    const path = window.location.pathname;
    let fileName = path.split('/').pop() || 'index.html';
    if (fileName === '') fileName = 'index.html';
    
    document.querySelectorAll('nav button, #mobile-menu button').forEach(btn => {
        const onclick = btn.getAttribute('onclick') || '';
        if (onclick.includes(fileName)) {
            btn.classList.add('text-accent');
        } else if (fileName === 'index.html' && (onclick.includes('landing') || onclick.includes('index.html'))) {
             btn.classList.add('text-accent');
        }
    });
});
    
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
    if (editId) {
        result = await sb.from('products').update(productData).eq('id', editId);
    } else {
        result = await sb.from('products').insert([productData]);
    }

    if (result.error) {
        alert('Hata: ' + result.error.message);
    } else {
        showToast(editId ? 'Ürün güncellendi' : 'Ürün eklendi');
        resetProductForm();
        loadProducts();
    }
}

async function deleteProduct(id) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    const sb = getSupabase();
    if (!sb) return;

    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) alert('Silme hatası: ' + error.message);
    else {
        showToast('Ürün silindi');
        loadProducts();
    }
}

function editProduct(id) {
    const p = products.find(item => item.id == id);
    if (!p) return;
    
    document.getElementById('prod-edit-id').value = p.id;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-old-price').value = p.old_price || p.oldPrice || '';
    document.getElementById('prod-image-url').value = p.image;
    document.getElementById('prod-desc').value = p.desc;
    document.getElementById('prod-badge').value = p.badge || '';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const container = document.getElementById('admin-product-list');
    if (!container) return;
    
    container.innerHTML = products.map(p => `
        <div class="flex items-center gap-4 p-4 bg-calith-gray rounded-2xl border border-white/5">
            <img src="${p.image}" class="w-16 h-16 object-cover rounded-xl">
            <div class="flex-1">
                <h4 class="font-bold">${p.name}</h4>
                <p class="text-xs text-gray-500">${p.price}₺ - ${p.category}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="editProduct(${p.id})" class="p-2 hover:text-calith-orange"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                <button onclick="deleteProduct(${p.id})" class="p-2 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

async function savePost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('editor').innerHTML;
    if (!title) { alert('Başlık gerekli!'); return; }

    const newPost = {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: document.getElementById('post-category').value,
        excerpt: document.getElementById('post-excerpt').value || 'Yeni bir yazı...',
        content,
        image: document.getElementById('post-cover').value || null,
        published: true
    };

    const sb = getSupabase();
    if (!sb) { alert('Hata: Supabase bağlantısı kurulamadı.'); return; }
    const { error } = await sb.from('posts').insert(newPost);
    if (error) {
        alert('Kayıt hatası: ' + error.message);
        console.error(error);
        return;
    }

    await loadPosts();
    showToast('Yazı yayınlandı!');
    document.getElementById('post-title').value = ''; 
    document.getElementById('post-excerpt').value = ''; 
    document.getElementById('post-cover').value = ''; 
    document.getElementById('editor').innerHTML = '<p>Yazına başla...</p>';
    showSection('blog');
}

function previewPost() { 
    const w = window.open('', '_blank'); 
    w.document.write(`<html><head><script src="https://cdn.tailwindcss.com"><\/script></head><body class="bg-black text-white p-8 max-w-3xl mx-auto">${document.getElementById('editor').innerHTML}</body></html>`); 
}

function addToCart(product, qty) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) { existing.qty += qty; } else { cart.push({ ...product, qty }); }
    saveCart(); 
    showToast(`${product.name} sepete eklendi`); 
    updateCartUI();
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
    const drawer = document.getElementById('cart-drawer'), overlay = document.getElementById('cart-overlay');
    if (!drawer || !overlay) return;
    if (drawer.classList.contains('open')) { 
        drawer.classList.remove('open'); 
        overlay.classList.add('hidden'); 
    } else { 
        drawer.classList.add('open'); 
        overlay.classList.remove('hidden'); 
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
    
    // Auto-login admin if token exists (simplified)
    if (localStorage.getItem('admin_token')) {
        const editor = document.getElementById('admin-editor');
        const login = document.getElementById('admin-login');
        if (editor && login) {
            editor.classList.remove('hidden');
            login.classList.add('hidden');
        }
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
    if (blogId) {
        setTimeout(() => showBlogDetail(blogId), 500);
    }
}

document.addEventListener('DOMContentLoaded', init);