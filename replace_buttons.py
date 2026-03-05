import glob

print("Starting button gradient replacements...")

files = glob.glob('src/pages/**/*.jsx', recursive=True)
files.extend(glob.glob('src/components/**/*.jsx', recursive=True))

count = 0
for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Replace solid rose button with gradient
        new_content = content.replace('bg-rose-600 hover:bg-rose-700', 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700')
        new_content = new_content.replace('bg-rose-600 text-white', 'bg-gradient-to-r from-rose-500 to-rose-600 text-white')
        new_content = new_content.replace('bg-primary hover:bg-primary-hover', 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700')
        new_content = new_content.replace('hover:bg-rose-700 shadow', 'hover:from-rose-600 hover:to-rose-700 shadow')

        # Clean up any duplicate classes
        new_content = new_content.replace('bg-gradient-to-r from-rose-500 to-rose-600 hover:bg-rose-700', 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700')
        
        if new_content != content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated gradient buttons in: {file}")
            
    except Exception as e:
        print(f"Error processing {file}: {e}")

print(f"Gradient replacement complete! Updated {count} files.")
