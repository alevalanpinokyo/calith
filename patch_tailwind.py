import os
import re

html_files = [
    'index.html', 'skills.html', 'shop.html', 'blog.html', 
    'about.html', 'premium.html', 'profile.html', 'admin.html'
]

tailwind_config = """
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        calith: {
                            orange: '#FF6B35',
                            dark: '#0A0A0A',
                            gray: '#1A1A1A',
                            light: '#2A2A2A',
                            accent: '#00D9FF'
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Oswald', 'sans-serif']
                    }
                }
            }
        }
    </script>
"""

for file in html_files:
    if not os.path.exists(file):
        continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if tailwind.config already exists
    if "tailwind.config" not in content:
        # Insert before </head>
        new_content = content.replace("</head>", f"{tailwind_config}</head>")
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Injected tailwind config into {file}")
    else:
        print(f"Tailwind config already in {file}")
