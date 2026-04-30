import os
import re
import datetime

def update_version():
    version_timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M")
    
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    
    for filename in html_files:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        content = re.sub(r'app.js\?v=[\w.-]+', f'app.js?v={version_timestamp}', content)
        new_content = re.sub(r'styles.css\?v=[\w.-]*|styles.css', f'styles.css?v={version_timestamp}', content)
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
    return version_timestamp

if __name__ == "__main__":
    ts = update_version()
    print(f"Tüm HTML dosyalari güncellendi: v={ts}")
