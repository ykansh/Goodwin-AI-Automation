from reportlab.pdfgen import canvas
import os

products = [
    ("gw-tz4lb-datasheet.pdf", "GW-TZ4LB"),
    ("gw-xl5lb-datasheet.pdf", "GW-XL5LB"),
    ("gw-xl2-5lc-datasheet.pdf", "GW-XL2.5LC"),
    ("gw-tz5lb-datasheet.pdf", "GW-TZ5LB"),
    ("gw-12smf8-ups-datasheet.pdf", "GW-12SMF8-UPS"),
    ("gw-4smf5-datasheet.pdf", "GW-4SMF5"),
    ("gw-4v7ah-vrla-datasheet.pdf", "GW-4V7AH-VRLA"),
    ("gw-6v5ah-datasheet.pdf", "GW-6V5AH"),
    ("gw-lithium-agro-14ah-datasheet.pdf", "GW-LITHIUM-AGRO-14AH"),
    ("gw-lithium-ups-8ah-datasheet.pdf", "GW-LITHIUM-UPS-8AH"),
    ("gw-vrla-agro-14ah-datasheet.pdf", "GW-VRLA-AGRO-14AH")
]

for filename, name in products:
    c = canvas.Canvas(f"public/assets/datasheets/{filename}")
    c.setFont("Helvetica-Bold", 24)
    c.drawString(100, 750, f"Datasheet: {name}")
    c.setFont("Helvetica", 14)
    c.drawString(100, 700, "Goodwin Batteries Premium Series")
    c.drawString(100, 650, "Technical Specifications:")
    c.drawString(120, 620, "- Maintenance Free / Advanced Technology")
    c.drawString(120, 590, "- Deep Cycle Capability")
    c.drawString(120, 560, "- Highly Reliable")
    c.drawString(100, 500, "For more information, please visit www.goodwinbatteries.com")
    c.save()

print("All PDFs generated!")
