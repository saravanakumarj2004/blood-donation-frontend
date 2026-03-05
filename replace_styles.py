import os
import glob

print("Starting style replacements...")

# Get all JSX files in pages and components
files = glob.glob('src/pages/**/*.jsx', recursive=True)
files.extend(glob.glob('src/components/**/*.jsx', recursive=True))
files.extend(glob.glob('src/components/*.jsx', recursive=True))

count = 0
for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Refine UI: Lighter borders, softer shadows
        new_content = content.replace('border-slate-200', 'border-slate-100')
        new_content = new_content.replace('border-slate-300', 'border-slate-200')
        new_content = new_content.replace('shadow-sm', 'shadow-[0_2px_8px_rgba(0,0,0,0.04)]')
        new_content = new_content.replace('shadow-md', 'shadow-[0_4px_12px_rgba(0,0,0,0.04)]')
        
        if new_content != content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated: {file}")
            
    except Exception as e:
        print(f"Error processing {file}: {e}")

print(f"Replacement complete! Updated {count} files.")
