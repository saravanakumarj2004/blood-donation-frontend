import os
import glob

print("Reverting Syne and refining typography...")

files = glob.glob('src/pages/**/*.jsx', recursive=True)
files.extend(glob.glob('src/components/**/*.jsx', recursive=True))
if os.path.exists('src/App.jsx'):
    files.append('src/App.jsx')

count = 0
for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content
        
        # 1. First, strip out 'font-syne' everywhere so we can start fresh
        new_content = new_content.replace('font-syne ', '')
        new_content = new_content.replace(' font-syne', '')
        
        # 2. For the main header in HospitalDashboard and logos, we'll keep Syne but make it lighter
        # In Hospital Dashboard
        if 'City General Hospital' in new_content or 'user?.name' in new_content:
            new_content = new_content.replace('text-3xl font-extrabold', 'font-syne text-3xl font-bold tracking-normal')
            new_content = new_content.replace('text-4xl font-black', 'font-syne text-3xl font-bold tracking-normal')
        
        # In Navbar/Layouts (Logo)
        if 'BloodStock' in new_content:
            new_content = new_content.replace('font-bold text-2xl tracking-tight text-neutral-900', 'font-syne font-bold text-2xl tracking-tight text-neutral-900')
            new_content = new_content.replace('font-extrabold text-2xl', 'font-syne font-bold text-2xl')

        # 3. For all the NUMBERS and STATS, we MUST NOT use Syne, it's too wide. We let it fall back to DM Sans/Inter
        new_content = new_content.replace('text-4xl font-extrabold text-slate-900', 'text-4xl font-bold text-slate-900 tracking-tight')

        if new_content != content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Refined typography in: {file}")
            
    except Exception as e:
        print(f"Error processing {file}: {e}")

print(f"Typography fix complete! Updated {count} files.")
