import os
import re

html_files = [
    'index.html', 'skills.html', 'shop.html', 'blog.html', 
    'about.html', 'premium.html', 'profile.html', 'admin.html'
]

for file in html_files:
    if not os.path.exists(file):
        continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Sadece daha önce eklenmemişse ekle
    if '<script src="https://unpkg.com/lucide@latest"></script>' not in content:
        # </head> etiketinden hemen önce ekle
        new_content = content.replace('</head>', '    <script src="https://unpkg.com/lucide@latest"></script>\n</head>')
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Lucide restored in {file}")
    else:
        print(f"Lucide already exists in {file}")

print("All HTML files updated.")
