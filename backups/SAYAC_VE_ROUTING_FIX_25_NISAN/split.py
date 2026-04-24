import re
import os
import shutil

html_path = r'f:\Project\HTML,CSS\Calith\index.html'
base_dir = r'f:\Project\HTML,CSS\Calith'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract head and shared top
head_match = re.search(r'<!DOCTYPE html>.*?<nav.*?/nav>', content, flags=re.DOTALL)
if not head_match:
    print("Could not find head/nav")
    exit(1)
head_nav = head_match.group(0)

mobile_menu_match = re.search(r'<!-- Mobile Menu -->.*?</div>\n', content, flags=re.DOTALL)
mobile_menu = mobile_menu_match.group(0) if mobile_menu_match else ""

# 2. Extract sections
sections_to_extract = ['landing', 'skill-library', 'skill-detail', 'premium', 'shop', 'product-detail', 'blog', 'blog-detail', 'admin', 'about']
sections_html = {}
for sec in sections_to_extract:
    match = re.search(fr'<!-- .*? -->\n<section id="{sec}".*?</section>', content, flags=re.DOTALL | re.IGNORECASE)
    if not match:
        match = re.search(fr'<section id="{sec}".*?</section>', content, flags=re.DOTALL)
    if match:
        sections_html[sec] = match.group(0)

# 3. Extract bottom shared
bottom_match = re.search(r'<!-- SEARCH MODAL -->.*?(?=<script>)', content, flags=re.DOTALL)
bottom_html = bottom_match.group(0) if bottom_match else ""

script_match = re.search(r'<script>(.*?)</script>', content, flags=re.DOTALL)
script_content = script_match.group(1).strip() if script_match else ""

end_html = "\n<script src=\"js/app.js\"></script>\n</body>\n</html>"

# 4. Save JS
os.makedirs(os.path.join(base_dir, 'js'), exist_ok=True)
with open(os.path.join(base_dir, 'js', 'app.js'), 'w', encoding='utf-8') as f:
    f.write(script_content)

# 5. Fix links in head_nav and mobile_menu
# We need to change onclick="showSection('xxx')" to href="xxx.html"
link_map = {
    'landing': 'index.html',
    'skill-library': 'skills.html',
    'premium': 'premium.html',
    'blog': 'blog.html',
    'shop': 'shop.html',
    'about': 'about.html',
    'admin': 'admin.html'
}

def replace_links(text):
    for sec, href in link_map.items():
        text = re.sub(fr'onclick="showSection\(\'{sec}\'\).*?"', f'onclick="window.location.href=\'{href}\'"', text)
        # also handle the toggling mobile menu versions
        text = re.sub(fr'onclick="showSection\(\'{sec}\'\); toggleMobileMenu\(\).*?"', f'onclick="window.location.href=\'{href}\'"', text)
    return text

head_nav = replace_links(head_nav)
mobile_menu = replace_links(mobile_menu)

# 6. Build Pages
pages = {
    'index.html': ['landing'],
    'skills.html': ['skill-library', 'skill-detail'],
    'premium.html': ['premium'],
    'shop.html': ['shop', 'product-detail'],
    'blog.html': ['blog', 'blog-detail'],
    'admin.html': ['admin'],
    'about.html': ['about']
}

for page, sects in pages.items():
    page_content = head_nav + "\n" + mobile_menu + "\n"
    for sec in sects:
        if sec in sections_html:
            # We want to remove 'hidden' class from the primary section of this page, and add 'active'
            # The primary section is sects[0]. (except for skills, shop, blog which toggle between list and detail via js later)
            sec_html = sections_html[sec]
            if sec == sects[0]:
                sec_html = re.sub(r'class="(.*?)hidden(.*?)"', r'class="\1\2 active"', sec_html)
            
            # Check for theme
            if 'theme-light' in sec_html and sec == sects[0]:
                # We need to change the body class in the page_content
                page_content = page_content.replace('theme-dark', 'theme-light')
                # and nav classes
                page_content = page_content.replace('bg-dark/80', 'bg-white/80').replace('border-primary', 'border-gray-200')

            page_content += sec_html + "\n"
    
    page_content += bottom_html + end_html
    
    with open(os.path.join(base_dir, page), 'w', encoding='utf-8') as f:
        f.write(page_content)

print("Split completed successfully.")
