import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html') and f != 'admin.html']

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove Cart Button
    cart_button_regex = r'<button class="relative p-2 text-gray-400 hover:text-white transition-colors" onclick="toggleCart\(\)">\s*<i data-lucide="shopping-cart"[^>]*></i>\s*<span id="cart-badge"[^>]*>0</span>\s*</button>'
    content = re.sub(cart_button_regex, '', content)
    
    # 2. Update Desktop Menu
    # We will find the desktop menu container and replace its inner contents.
    # Note: each file has different active states (e.g. text-white vs text-gray-400).
    # We will just rewrite the menu fully, setting active states conditionally.
    
    desktop_menu_start = content.find('<!-- Desktop Menu -->')
    if desktop_menu_start == -1:
        # Fallback if no comment
        desktop_menu_start = content.find('<div class="hidden md:flex items-center gap-8">')
    
    if desktop_menu_start != -1:
        end_div = content.find('</div>', desktop_menu_start)
        # Find exactly where the div starts if comment used
        div_start = content.find('<div class="hidden md:flex items-center gap-8">', desktop_menu_start)
        
        if div_start != -1:
            closing_div = content.find('</div>', div_start)
            old_menu = content[div_start:closing_div+6]
            
            is_index = "text-white" in re.search(r'<a href="index.html" class="([^"]*)"', old_menu).group(1) if re.search(r'<a href="index.html" class="([^"]*)"', old_menu) else False
            is_skills = "text-white" in re.search(r'<a href="skills.html" class="([^"]*)"', old_menu).group(1) if re.search(r'<a href="skills.html" class="([^"]*)"', old_menu) else False
            is_blog = "text-white" in re.search(r'<a href="blog.html" class="([^"]*)"', old_menu).group(1) if re.search(r'<a href="blog.html" class="([^"]*)"', old_menu) else False
            is_about = "text-white" in re.search(r'<a href="about.html" class="([^"]*)"', old_menu).group(1) if re.search(r'<a href="about.html" class="([^"]*)"', old_menu) else False
            is_premium = "text-white" in re.search(r'<a href="premium.html" class="([^"]*)"', old_menu).group(1) if re.search(r'<a href="premium.html" class="([^"]*)"', old_menu) else False
            
            active_class = "text-white font-medium text-sm"
            inactive_class = "text-gray-400 hover:text-white transition-colors text-sm font-medium"
            premium_class = "text-calith-orange font-bold text-sm tracking-widest hover:text-white transition-colors uppercase"
            
            new_menu_html = '<div class="hidden md:flex items-center gap-8">\n'
            new_menu_html += f'                <a href="index.html" class="{active_class if is_index else inactive_class}">ANA SAYFA</a>\n'
            new_menu_html += f'                <a href="skills.html" class="{active_class if is_skills else inactive_class}">PROGRAMLAR</a>\n'
            new_menu_html += f'                <a href="blog.html" class="{active_class if is_blog else inactive_class}">ÖĞREN</a>\n'
            new_menu_html += f'                <a href="about.html" class="{active_class if is_about else inactive_class}">HAKKIMIZDA</a>\n'
            new_menu_html += f'                <a href="premium.html" class="{premium_class}">KOÇLUK</a>\n'
            new_menu_html += '            </div>'
            
            content = content[:div_start] + new_menu_html + content[closing_div+6:]

    # 3. Update Mobile Menu
    mobile_menu_start = content.find('<div id="mobile-menu"')
    if mobile_menu_start != -1:
        mobile_menu_inner = content.find('<div class="px-4 py-4', mobile_menu_start)
        if mobile_menu_inner != -1:
            mobile_closing_div = content.find('</div>', mobile_menu_inner)
            old_mobile_menu = content[mobile_menu_inner:mobile_closing_div+6]
            
            is_index_m = "text-white" in re.search(r'<a href="index.html" class="([^"]*)"', old_mobile_menu).group(1) if re.search(r'<a href="index.html" class="([^"]*)"', old_mobile_menu) else False
            is_skills_m = "text-white" in re.search(r'<a href="skills.html" class="([^"]*)"', old_mobile_menu).group(1) if re.search(r'<a href="skills.html" class="([^"]*)"', old_mobile_menu) else False
            is_blog_m = "text-white" in re.search(r'<a href="blog.html" class="([^"]*)"', old_mobile_menu).group(1) if re.search(r'<a href="blog.html" class="([^"]*)"', old_mobile_menu) else False
            is_about_m = "text-white" in re.search(r'<a href="about.html" class="([^"]*)"', old_mobile_menu).group(1) if re.search(r'<a href="about.html" class="([^"]*)"', old_mobile_menu) else False
            is_premium_m = "text-white" in re.search(r'<a href="premium.html" class="([^"]*)"', old_mobile_menu).group(1) if re.search(r'<a href="premium.html" class="([^"]*)"', old_mobile_menu) else False
            
            active_m = "block text-white py-2"
            inactive_m = "block text-gray-400 hover:text-white py-2"
            premium_m = "block text-calith-orange font-bold py-2 uppercase tracking-widest"
            
            new_m_html = '<div class="px-4 py-4 space-y-3">\n'
            new_m_html += f'            <a href="index.html" class="{active_m if is_index_m else inactive_m}">ANA SAYFA</a>\n'
            new_m_html += f'            <a href="skills.html" class="{active_m if is_skills_m else inactive_m}">PROGRAMLAR</a>\n'
            new_m_html += f'            <a href="blog.html" class="{active_m if is_blog_m else inactive_m}">ÖĞREN</a>\n'
            new_m_html += f'            <a href="about.html" class="{active_m if is_about_m else inactive_m}">HAKKIMIZDA</a>\n'
            new_m_html += f'            <a href="premium.html" class="{premium_m}">KOÇLUK</a>\n'
            new_m_html += '        </div>'
            
            content = content[:mobile_menu_inner] + new_m_html + content[mobile_closing_div+6:]
            
    # 4. Remove Cart Sidebar and Overlay
    cart_sidebar_regex = r'<!-- Cart Elements.*?<div id="cart-overlay"[^>]*></div>'
    content = re.sub(cart_sidebar_regex, '', content, flags=re.DOTALL)
    
    # Alternative naming in some files might be "Cart Drawer" or similar, just remove the specific div ids
    cart_sidebar_div_regex = r'<div id="cart-sidebar"[\s\S]*?<div id="cart-overlay"[^>]*></div>'
    content = re.sub(cart_sidebar_div_regex, '', content)

    # 5. Fix Call to Action buttons
    content = content.replace('>Hemen Başla</button>', '>Ücretsiz Başla</button>')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("HTML files updated.")
