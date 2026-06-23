import os

app_dir = r"C:\Users\lcgui\.gemini\antigravity\scratch\personal-finance-app"
index_path = os.path.join(app_dir, "index.html")
style_path = os.path.join(app_dir, "style.css")
app_js_path = os.path.join(app_dir, "app.js")
output_path = os.path.join(app_dir, "site123_embed.html")

with open(index_path, "r", encoding="utf-8") as f:
    index_content = f.read()

with open(style_path, "r", encoding="utf-8") as f:
    css_content = f.read()

with open(app_js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

# Replace <link rel="stylesheet" href="style.css"> with <style>css_content</style>
style_tag = f"<style>\n{css_content}\n</style>"
index_content = index_content.replace('<link rel="stylesheet" href="style.css">', style_tag)

# Replace <script src="app.js"></script> with <script>js_content</script>
script_tag = f"<script>\n{js_content}\n</script>"
index_content = index_content.replace('<script src="app.js"></script>', script_tag)

with open(output_path, "w", encoding="utf-8") as f:
    f.write(index_content)

print("Bundled successfully!")
