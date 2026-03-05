import os
import glob
import re

print("Starting color theme replacements (blue to rose)...")

# Get all JSX files in pages and components
files = glob.glob('src/pages/**/*.jsx', recursive=True)
files.extend(glob.glob('src/components/**/*.jsx', recursive=True))

count = 0
for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Refine UI: Blue to Rose theme matching
        new_content = content.replace('bg-blue-', 'bg-rose-')
        new_content = new_content.replace('text-blue-', 'text-rose-')
        new_content = new_content.replace('border-blue-', 'border-rose-')
        new_content = new_content.replace('ring-blue-', 'ring-rose-')
        new_content = new_content.replace('shadow-blue-', 'shadow-rose-')
        
        # Exception handling if there are any raw blue colors like text-blue
        # although tailwind requires the number text-blue-500
        
        if new_content != content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated: {file}")
            
    except Exception as e:
        print(f"Error processing {file}: {e}")

print(f"Replacement complete! Updated {count} files.")
