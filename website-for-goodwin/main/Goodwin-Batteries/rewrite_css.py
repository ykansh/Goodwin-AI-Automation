import re

with open("app/globals.css", "r") as f:
    content = f.read()

# Remove .dark { ... } block
content = re.sub(r'\.dark\s*\{[^}]+\}', '', content)

# Remove @media (prefers-color-scheme: dark) { ... } block
# It has a nested block, so regex needs to be careful
content = re.sub(r'@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{[^}]+\}\s*\}', '', content)

# Remove .dark .glass { ... } block
content = re.sub(r'\.dark\s*\.glass\s*\{[^}]+\}', '', content)

# Remove @custom-variant dark
content = re.sub(r'@custom-variant dark[^;]+;', '', content)

with open("app/globals.css", "w") as f:
    f.write(content.strip() + "\n")

print("Dark mode stripped")
