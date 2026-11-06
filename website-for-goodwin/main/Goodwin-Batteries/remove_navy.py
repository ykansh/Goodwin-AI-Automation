import os
import re

files_to_process = [
    "app/support/page.tsx",
    "components/home/HomePageClient.tsx",
    "components/vehicle-finder/VehicleFinder.tsx",
    "components/forms/QuickEnquiryForm.tsx",
    "components/layout/Navbar.tsx",
    "components/layout/Footer.tsx"
]

for file_path in files_to_process:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, "r") as f:
        content = f.read()
        
    # Backgrounds & Gradients
    content = content.replace("bg-navy-dark", "bg-background")
    content = content.replace("bg-navy", "bg-surface")
    content = content.replace("text-navy", "text-foreground")
    content = content.replace("from-navy", "from-surface")
    content = content.replace("via-navy", "via-surface")
    
    # Borders
    content = content.replace("border-silver/10", "border-border")
    content = content.replace("border-silver/20", "border-border")
    content = content.replace("border-white/10", "border-border")
    content = content.replace("border-white/20", "border-border")
    content = content.replace("border-silver/50", "border-border")
    content = content.replace("border-silver/30", "border-border")
    content = content.replace("border-silver", "border-border")
    
    # Texts
    content = content.replace("text-silver", "text-muted-foreground")
    content = content.replace("text-white/80", "text-muted-foreground")
    content = content.replace("text-white/50", "text-muted-foreground")
    
    # Handle text-white specifically. If it's a brand button, we want to KEEP text-white.
    # If it's a transparent button, we want text-foreground.
    # We will split into lines, and if a line has "bg-brand" and "text-white", we leave text-white.
    # If a line has "text-white", we replace it with "text-foreground" unless it has "bg-brand".
    new_lines = []
    for line in content.split('\n'):
        # For VehicleFinder, "text-white" in header should be foreground
        if "bg-brand" in line and "text-white" in line:
            new_lines.append(line)
        elif "bg-transparent text-white" in line:
            line = line.replace("bg-transparent text-white", "bg-transparent text-foreground")
            new_lines.append(line)
        else:
            new_lines.append(line.replace("text-white", "text-foreground"))
            
    content = "\n".join(new_lines)
    
    # Some specific fixes
    content = content.replace("text-foreground/50", "text-muted-foreground")
    
    with open(file_path, "w") as f:
        f.write(content)
        
print("Navy removal complete.")
