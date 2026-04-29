import os
import re

html_files = [
    'index.html', 'skills.html', 'shop.html', 'blog.html', 
    'about.html', 'premium.html', 'profile.html', 'admin.html'
]

def get_nav_template(active_page):
    def desktop_class(page):
        if page == active_page:
            return "text-calith-orange font-bold text-base"
        return "text-white font-medium hover:text-calith-orange text-base"

    def mobile_class(page):
        if page == active_page:
            return "text-calith-orange font-bold text-base"
        return "text-white font-medium hover:text-calith-orange text-base"

    dumbbell_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-white"><path d="m14.5 17.5-1-1"/><path d="m10.5 13.5-1-1"/><path d="m14 14-4-4"/><path d="m6 10-1-1"/><path d="m9.5 6.5-1-1"/><path d="m14 19-3-3-4 4-2-2 4-4-3-3"/><path d="m10 5 3 3 4-4 2 2-4 4 3 3"/></svg>'
    user_circle_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>'
    user_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7 text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
    menu_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7 text-white"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>'

    return f'''<nav id="global-nav" class="fixed top-0 left-0 right-0 z-50 nav-blur border-b border-white/5 bg-[#0A0A0A]/85 shadow-2xl shadow-black/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="grid grid-cols-[auto_1fr_auto] items-center h-20 gap-4">
            <!-- Logo (Sol Kolon) -->
            <a href="index.html" class="flex items-center gap-3 cursor-pointer shrink-0" id="logo-container" title="Ana Sayfaya Git">
                <div class="shrink-0 w-11 h-11 bg-gradient-to-br from-calith-orange to-calith-accent rounded-xl flex items-center justify-center shadow-lg shadow-calith-orange/20">
                    {dumbbell_svg}
                </div>
                <span class="font-display text-2xl font-black tracking-wider text-white">CALITH</span>
            </a>

            <!-- Desktop Menu (Orta Kolon - Her zaman tam merkez) -->
            <div class="hidden lg:flex items-center justify-center gap-8">
                <a href="index.html" class="{desktop_class('index')} whitespace-nowrap transition-all">ANA SAYFA</a>
                <a href="skills.html" class="{desktop_class('skills')} whitespace-nowrap transition-all">PROGRAMLAR</a>
                <a href="shop.html" class="{desktop_class('shop')} whitespace-nowrap transition-all">EKİPMAN</a>
                <a href="blog.html" class="{desktop_class('blog')} whitespace-nowrap transition-all">ÖĞREN</a>
                <a href="about.html" class="{desktop_class('about')} whitespace-nowrap transition-all">HAKKIMIZDA</a>
                <a href="premium.html" class="{desktop_class('premium')} whitespace-nowrap uppercase tracking-widest transition-all drop-shadow-[0_0_8px_rgba(255,107,53,0.3)]">KOÇLUK</a>
            </div>
            <!-- Mobilde orta kolon boş kalır -->
            <div class="lg:hidden"></div>

            <!-- Actions (Sağ Kolon - Her zaman sağda) -->
            <div class="flex items-center gap-3 justify-end">
                <a href="profile.html" class="{desktop_class('profile')} hidden lg:flex items-center gap-2 transition-all group drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] hover:drop-shadow-[0_0_12px_rgba(255,107,53,0.6)]">
                    {user_circle_svg} <span class="auth-text tracking-wider whitespace-nowrap">PROFİLİM</span>
                </a>
                {'<a href="skills.html" class="hidden md:block btn-primary px-6 py-3 rounded-xl font-bold text-sm text-center shadow-xl shadow-calith-orange/20 hover:scale-105 transition-transform whitespace-nowrap">Hemen Başla</a>' if active_page == 'index' else ''}
                <button class="lg:hidden p-2 text-white hover:text-calith-orange transition-colors" onclick="toggleMobileMenu()" aria-label="Menü">
                    {menu_svg}
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Menu -->
    <div id="mobile-menu" class="hidden lg:hidden border-t border-white/10 bg-[#050505] shadow-2xl">
        <div class="px-5 py-6 space-y-4">
            <a href="index.html" class="{mobile_class('index')} block py-2 transition-colors">ANA SAYFA</a>
            <a href="skills.html" class="{mobile_class('skills')} block py-2 transition-colors">PROGRAMLAR</a>
            <a href="shop.html" class="{mobile_class('shop')} block py-2 transition-colors">EKİPMAN</a>
            <a href="blog.html" class="{mobile_class('blog')} block py-2 transition-colors">ÖĞREN</a>
            <a href="about.html" class="{mobile_class('about')} block py-2 transition-colors">HAKKIMIZDA</a>
            <a href="premium.html" class="{mobile_class('premium')} block py-2 uppercase tracking-widest transition-colors">KOÇLUK</a>
            <a href="profile.html" class="{mobile_class('profile')} block py-3 transition-colors flex items-center gap-3 border-t border-white/10 mt-4 pt-4 font-bold text-lg">{user_circle_svg} <span class="auth-text">PROFİLİM</span></a>
        </div>
    </div>
</nav>'''

for file in html_files:
    if not os.path.exists(file):
        continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    page_name = file.replace('.html', '')
    new_nav = get_nav_template(page_name)
    
    pattern = re.compile(r'<nav id="global-nav".*?</nav>', re.DOTALL)
    
    if pattern.search(content):
        new_content = pattern.sub(new_nav, content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated SVG UI nav in {file}")
