import re
import os

html_path = 'index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Split the file using known markers
# 1. Head
head_end = text.find('<!-- Navigation -->')
head_html = text[:head_end]

# 2. Navigation
nav_start = head_end
nav_end = text.find('<!-- Mobile Menu -->', nav_start)
nav_html = text[nav_start:nav_end]

# 3. Mobile Menu
mobile_start = nav_end
# The first section is LANDING
mobile_end = text.find('<!-- LANDING -->', mobile_start)
mobile_html = text[mobile_start:mobile_end]

# 4. Extract sections
# We will use regex to find all sections
sections_dict = {}
for sec_id in ['landing', 'skill-library', 'skill-detail', 'premium', 'shop', 'product-detail', 'blog', 'blog-detail', 'admin', 'about']:
    pattern = fr'(<!-- [A-Z\s&]+ -->\s*)?<section id="{sec_id}"[^>]*>.*?</section>'
    match = re.search(pattern, text, flags=re.DOTALL)
    if match:
        sections_dict[sec_id] = match.group(0)
    else:
        print(f"Warning: {sec_id} not found!")

# 5. Extract Search Modal
search_match = re.search(r'<!-- SEARCH MODAL -->.*?</div>\s*</div>', text, flags=re.DOTALL)
search_html = search_match.group(0) if search_match else ""

# 6. Extract Bottom Shared (Cart, Toast, Mobile Cart)
bottom_start = text.find('<!-- CART -->')
bottom_end = text.find('<script>', bottom_start)
bottom_html = text[bottom_start:bottom_end]

# 7. Extract Script
script_match = re.search(r'<script>(.*?)</script>', text, flags=re.DOTALL)
script_content = script_match.group(1).strip() if script_match else ""


link_replacements = {
    "showSection('landing')": "window.location.href='index.html'",
    "showSection('skill-library')": "window.location.href='skills.html'",
    "showSection('premium')": "window.location.href='premium.html'",
    "showSection('blog')": "window.location.href='blog.html'",
    "showSection('shop')": "window.location.href='shop.html'",
    "showSection('about')": "window.location.href='about.html'",
    "showSection('admin')": "window.location.href='admin.html'"
}

def fix_links(html):
    for old, new in link_replacements.items():
        html = html.replace(old, new)
    
    html = html.replace('onclick="window.location.href=\'index.html\'; toggleMobileMenu()"', 'onclick="window.location.href=\'index.html\'"')
    html = html.replace('onclick="window.location.href=\'blog.html\'; toggleMobileMenu()"', 'onclick="window.location.href=\'blog.html\'"')
    html = html.replace('onclick="window.location.href=\'shop.html\'; toggleMobileMenu()"', 'onclick="window.location.href=\'shop.html\'"')
    html = html.replace('onclick="window.location.href=\'about.html\'; toggleMobileMenu()"', 'onclick="window.location.href=\'about.html\'"')
    
    html = html.replace("showSkill('handstand')", "window.location.href='skills.html?skill=handstand'")
    html = html.replace("showSkill('l-sit')", "window.location.href='skills.html?skill=l-sit'")
    html = html.replace("showSkill('planche')", "window.location.href='skills.html?skill=planche'")
    html = html.replace("showSkill('muscle-up')", "window.location.href='skills.html?skill=muscle-up'")
    html = html.replace("showSkill('back-lever')", "window.location.href='skills.html?skill=back-lever'")
    
    html = html.replace("showPremium('ground')", "window.location.href='premium.html?cat=ground'")
    html = html.replace("showPremium('parallettes')", "window.location.href='premium.html?cat=parallettes'")
    html = html.replace("showPremium('rings')", "window.location.href='premium.html?cat=rings'")
    
    html = html.replace("showPremiumDetail('ground', 'beginner')", "window.location.href='premium.html?cat=ground&level=beginner'")
    html = html.replace("showPremiumDetail('ground', 'intermediate')", "window.location.href='premium.html?cat=ground&level=intermediate'")
    html = html.replace("showPremiumDetail('ground', 'advanced')", "window.location.href='premium.html?cat=ground&level=advanced'")
    html = html.replace("showPremiumDetail('parallettes', 'beginner')", "window.location.href='premium.html?cat=parallettes&level=beginner'")
    html = html.replace("showPremiumDetail('parallettes', 'intermediate')", "window.location.href='premium.html?cat=parallettes&level=intermediate'")
    html = html.replace("showPremiumDetail('parallettes', 'advanced')", "window.location.href='premium.html?cat=parallettes&level=advanced'")
    html = html.replace("showPremiumDetail('rings', 'beginner')", "window.location.href='premium.html?cat=rings&level=beginner'")
    html = html.replace("showPremiumDetail('rings', 'intermediate')", "window.location.href='premium.html?cat=rings&level=intermediate'")
    html = html.replace("showPremiumDetail('rings', 'advanced')", "window.location.href='premium.html?cat=rings&level=advanced'")
    
    return html


# Write HTML pages
pages = {
    'index.html': ['landing'],
    'skills.html': ['skill-library', 'skill-detail'],
    'premium.html': ['premium'],
    'shop.html': ['shop', 'product-detail'],
    'blog.html': ['blog', 'blog-detail'],
    'admin.html': ['admin'],
    'about.html': ['about']
}

for page, s_ids in pages.items():
    page_html = head_html
    n_html = nav_html
    
    is_light = 'shop' in s_ids or 'product-detail' in s_ids
    if is_light:
        page_html = page_html.replace('theme-dark', 'theme-light')
        n_html = n_html.replace('bg-dark/80', 'bg-white/80').replace('border-primary', 'border-gray-200').replace('text-white', 'text-black')
    
    page_html += fix_links(n_html)
    page_html += fix_links(mobile_html)
    page_html += fix_links(search_html) + "\n"
    
    for s in s_ids:
        if s in sections_dict:
            # Let CSS handle visibility, or remove 'hidden' class from the default section of the page
            sec_html = sections_dict[s]
            if s == s_ids[0]: # main section of the page should not be hidden
                sec_html = sec_html.replace('hidden ', '')
            page_html += fix_links(sec_html) + "\n"
            
    page_html += bottom_html + "\n<script src=\"js/app.js\"></script>\n</body>\n</html>"
    with open(page, 'w', encoding='utf-8') as f:
        f.write(page_html)


os.makedirs('js', exist_ok=True)
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(script_content)

print('Success')
