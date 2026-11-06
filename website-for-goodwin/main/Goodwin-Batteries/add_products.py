import json

with open('data/goodwinProducts.json', 'r') as f:
    products = json.load(f)

new_products = [
    {
        "id": "prod-12smf8",
        "name": "GW-12SMF8-UPS",
        "series": "Goodwin Industrial",
        "slug": "gw-12smf8-ups",
        "voltage": "12V",
        "capacity": "8Ah",
        "technology": "SMF / VRLA",
        "application": "UPS & Inverters",
        "warrantyOptions": ["12 Months", "24 Months"],
        "image": "/assets/products/goodwin-12smf8-ups-12v-8ah.png",
        "description": "High reliable VRLA battery for UPS and backup power applications.",
        "dimensions": "151 x 65 x 94 mm",
        "weight": "2.10 kg",
        "terminalLayout": "F1 / F2 Faston",
        "datasheet": "/assets/datasheets/gw-12smf8-ups-datasheet.pdf"
    },
    {
        "id": "prod-4smf5",
        "name": "GW-4SMF5",
        "series": "Goodwin Industrial",
        "slug": "gw-4smf5",
        "voltage": "4V",
        "capacity": "5Ah",
        "technology": "SMF / VRLA",
        "application": "Torch & Emergency Lights",
        "warrantyOptions": ["6 Months"],
        "image": "/assets/products/goodwin-4smf5-torch-4v-5ah.png",
        "description": "Compact SMF battery optimized for portable lighting and small electronics.",
        "dimensions": "47 x 47 x 101 mm",
        "weight": "0.45 kg",
        "terminalLayout": "Wire Leads / Solder Tabs",
        "datasheet": "/assets/datasheets/gw-4smf5-datasheet.pdf"
    },
    {
        "id": "prod-4v7ah",
        "name": "GW-4V7AH-VRLA",
        "series": "Goodwin Industrial",
        "slug": "gw-4v7ah-vrla",
        "voltage": "4V",
        "capacity": "7Ah",
        "technology": "SMF / VRLA",
        "application": "Scales & Emergency Lights",
        "warrantyOptions": ["6 Months"],
        "image": "/assets/products/goodwin-4v-7ah-vrla.png",
        "description": "Reliable power for electronic weighing scales and emergency lamps.",
        "dimensions": "47 x 47 x 101 mm",
        "weight": "0.65 kg",
        "terminalLayout": "F1 Faston",
        "datasheet": "/assets/datasheets/gw-4v7ah-vrla-datasheet.pdf"
    },
    {
        "id": "prod-6v5ah",
        "name": "GW-6V5AH",
        "series": "Goodwin Industrial",
        "slug": "gw-6v5ah",
        "voltage": "6V",
        "capacity": "5Ah",
        "technology": "SMF / VRLA",
        "application": "Toys & Medical Devices",
        "warrantyOptions": ["6 Months"],
        "image": "/assets/products/goodwin-6v-5ah-toy.png",
        "description": "Deep discharge capable SMF battery for ride-on toys and medical equipment.",
        "dimensions": "70 x 47 x 101 mm",
        "weight": "0.75 kg",
        "terminalLayout": "F1 Faston",
        "datasheet": "/assets/datasheets/gw-6v5ah-datasheet.pdf"
    },
    {
        "id": "prod-li-agro14",
        "name": "GW-LITHIUM-AGRO-14AH",
        "series": "Goodwin Lithium",
        "slug": "gw-lithium-agro-14ah",
        "voltage": "12V",
        "capacity": "14Ah",
        "technology": "Lithium-Ion (LiFePO4)",
        "application": "Agricultural & Sprayers",
        "warrantyOptions": ["24 Months", "36 Months"],
        "image": "/assets/products/goodwin-lithium-agro-12v-14ah.png",
        "description": "Ultra lightweight, high life-cycle lithium battery designed for agricultural sprayers.",
        "dimensions": "151 x 98 x 95 mm",
        "weight": "1.30 kg",
        "terminalLayout": "F2 Faston",
        "datasheet": "/assets/datasheets/gw-lithium-agro-14ah-datasheet.pdf"
    },
    {
        "id": "prod-li-ups8",
        "name": "GW-LITHIUM-UPS-8AH",
        "series": "Goodwin Lithium",
        "slug": "gw-lithium-ups-8ah",
        "voltage": "12V",
        "capacity": "8Ah",
        "technology": "Lithium-Ion (LiFePO4)",
        "application": "UPS & Inverters",
        "warrantyOptions": ["36 Months", "60 Months"],
        "image": "/assets/products/goodwin-lithium-ups-12v-8ah.png",
        "description": "Premium lithium drop-in replacement for standard 12V 7Ah/8Ah lead acid UPS batteries.",
        "dimensions": "151 x 65 x 94 mm",
        "weight": "0.95 kg",
        "terminalLayout": "F2 Faston",
        "datasheet": "/assets/datasheets/gw-lithium-ups-8ah-datasheet.pdf"
    },
    {
        "id": "prod-vrla-agro14",
        "name": "GW-VRLA-AGRO-14AH",
        "series": "Goodwin Industrial",
        "slug": "gw-vrla-agro-14ah",
        "voltage": "12V",
        "capacity": "14Ah",
        "technology": "SMF / VRLA",
        "application": "Agricultural & Sprayers",
        "warrantyOptions": ["6 Months", "12 Months"],
        "image": "/assets/products/goodwin-vrla-12v-14ah.png",
        "description": "Heavy duty VRLA battery optimized for continuous cyclic use in agricultural sprayers.",
        "dimensions": "151 x 98 x 95 mm",
        "weight": "3.80 kg",
        "terminalLayout": "F2 Faston",
        "datasheet": "/assets/datasheets/gw-vrla-agro-14ah-datasheet.pdf"
    }
]

products.extend(new_products)

with open('data/goodwinProducts.json', 'w') as f:
    json.dump(products, f, indent=2)

print("Added new products!")
