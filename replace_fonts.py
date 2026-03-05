import os
import glob
import re

print("Starting typography updates (Applying Syne to headings)...")

# Get all JSX files in pages and components
files = glob.glob('src/pages/**/*.jsx', recursive=True)
files.extend(glob.glob('src/components/**/*.jsx', recursive=True))
# Also check top-level App
if os.path.exists('src/App.jsx'):
    files.append('src/App.jsx')

count = 0
for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content
        
        # 1. Update logo text
        new_content = new_content.replace('font-extrabold text-2xl tracking-tight', 'font-syne font-extrabold text-2xl tracking-tight')
        
        # 2. Update h1, h2, h3, h4 tags specifically (adding font-syne to the existing classes if they have font-bold/extrabold etc)
        # Using a safer replace approach for common class patterns instead of complex regex
        new_content = new_content.replace('text-4xl font-black', 'font-syne text-4xl font-black')
        new_content = new_content.replace('text-3xl font-bold', 'font-syne text-3xl font-bold')
        new_content = new_content.replace('text-2xl font-bold', 'font-syne text-2xl font-bold')
        new_content = new_content.replace('text-xl font-bold', 'font-syne text-xl font-bold')
        new_content = new_content.replace('text-lg font-bold', 'font-syne text-lg font-bold')
        new_content = new_content.replace('text-base font-bold', 'font-syne text-base font-bold')
        new_content = new_content.replace('text-[10px] font-bold', 'font-syne text-[10px] font-bold')
        
        # Clean up duplicates if we accidentally added multiple
        new_content = new_content.replace('font-syne font-syne', 'font-syne')
        
        if new_content != content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated typography in: {file}")
            
    except Exception as e:
        print(f"Error processing {file}: {e}")

print(f"Typography replacement complete! Updated {count} files.")
