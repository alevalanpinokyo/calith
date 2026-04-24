import os
import re
import datetime

def update_version():
    # Yeni sürüm numarası olarak bugünün tarihini ve saatini kullanalım (Aşırı garanti yöntem)
    new_version = datetime.datetime.now().strftime("%Y%m%d%H%M")
    
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    
    for filename in html_files:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # app.js?v=... kısmını bul ve yeni versiyonla değiştir
        new_content = re.sub(r'app.js\?v=[\w.-]+', f'app.js?v={new_version}', content)
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
    print(f"✅ Tüm HTML dosyaları güncellendi: v={new_version}")

if __name__ == "__main__":
    update_version()
