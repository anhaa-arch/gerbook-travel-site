from PIL import Image
try:
    img = Image.open("public/header.png")
    print(f"Size: {img.size}")
    print(f"Top-left pixel: {img.getpixel((0,0))}")
except Exception as e:
    print(f"Error: {e}")
