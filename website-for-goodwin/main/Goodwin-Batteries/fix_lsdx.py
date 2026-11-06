import re

with open("app/admin/labels/print/[batchId]/page.tsx", "r") as f:
    content = f.read()

# Remove drawobj id="5" (QR code)
pattern = re.compile(r'<!-- QR Code -->.*?id="5".*?</drawobj>\n', re.DOTALL)
content = pattern.sub('', content)

# Remove objvarlink part for :5,105
content = content.replace(':5,105', '')

# Modify Barcode id="6" left from 1300 to 100
content = content.replace('id="6" name="" left="1300" top="900" right="3700"', 'id="6" name="" left="100" top="900" right="3700"')

# Write it back
with open("app/admin/labels/print/[batchId]/page.tsx", "w") as f:
    f.write(content)

print("Fixed layout")
