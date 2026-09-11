import glob

# Files to update
files = glob.glob('src/components/modals/*.tsx') + glob.glob('src/components/leads/*.tsx')

target = 'className="fixed inset-0 z-[200] flex flex-col bg-[#f8faf8] dark:bg-[#121412] h-[100dvh] w-full overflow-hidden animate-fade-in"'
replacement = 'className="absolute inset-0 z-50 flex flex-col bg-[#f8faf8] dark:bg-[#121412] h-full w-full animate-fade-in"'

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    if target in content:
        with open(f, 'w') as file:
            file.write(content.replace(target, replacement))
        print(f"Updated {f}")
