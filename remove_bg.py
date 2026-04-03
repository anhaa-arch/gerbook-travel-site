from PIL import Image
import sys

def remove_background(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    new_data = []
    # Get the background color from the top left corner as a reference
    bg_color = datas[0]
    
    # Alternatively, we can just look for anything very bright (close to white/cream)
    # The image I saw had a cream background.
    
    for item in datas:
        # Check if the pixel is close to the background color or very bright
        # item is (R, G, B, A)
        # Background is roughly (244, 241, 234)
        r, g, b, a = item
        
        # If it's very close to the background color, make it transparent
        # We can use a threshold.
        distance = ((r - bg_color[0])**2 + (g - bg_color[1])**2 + (b - bg_color[2])**2)**0.5
        
        if distance < 30: # Threshold for "close to background"
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Processed {input_path} -> {output_path}")

if __name__ == "__main__":
    remove_background("public/header.png", "public/header-transparent.png")
