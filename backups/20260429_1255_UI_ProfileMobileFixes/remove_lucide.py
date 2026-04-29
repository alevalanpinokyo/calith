import os
import re

html_files = [
    'index.html', 'skills.html', 'shop.html', 'blog.html', 
    'about.html', 'premium.html', 'profile.html', 'admin.html'
]

lucide_pattern = re.compile(r'<script src="https://unpkg\.com/lucide@latest"></script>')
lucide_call_pattern = re.compile(r'lucide\.createIcons\(\);?')

for file in html_files:
    if not os.path.exists(file):
        continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Script tagini kaldır
    new_content = lucide_pattern.sub('', content)
    # createIcons() çağrısı varsa onu da kaldır
    new_content = lucide_call_pattern.sub('', new_content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Lucide removed from {file}")
