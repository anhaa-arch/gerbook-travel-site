import sys
import os

with open("py_debug.log", "w") as f:
    f.write("Starting script\n")
    try:
        from PIL import Image
        f.write("PIL imported\n")
        img = Image.open("public/header.png")
        f.write(f"Image opened: {img.size}\n")
        img = img.convert("RGBA")
        datas = img.getdata()
        new_data = []
        bg_color = datas[0]
        f.write(f"Background color: {bg_color}\n")
        
        for item in datas:
            r, g, b, a = item
            # Threshold for "close to background"
            if abs(r - bg_color[0]) < 20 and abs(g - bg_color[1]) < 20 and abs(b - bg_color[2]) < 20:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        
        img.putdata(new_data)
        img.save("public/header-transparent.png", "PNG")
        f.write("Image saved as public/header-transparent.png\n")
    except Exception as e:
        f.write(f"Error: {e}\n")
