from PIL import Image
import os

icons_dir = os.path.join(os.getcwd(), 'public', 'icons')
os.makedirs(icons_dir, exist_ok=True)

src_path = 'C:/Users/Lenovo/.gemini/antigravity/brain/f8441e03-cb79-45f2-aed3-d51183d3059d/.user_uploaded/media_1795393948260_41dbe208.jpg'
if not os.path.exists(src_path):
    src_path = os.path.join(os.getcwd(), 'public', 'images', 'app-logo.png')

img = Image.open(src_path).convert('RGBA')
w, h = img.size
pixels = img.load()

# Flood fill outer white to transparent
visited = [[False]*h for _ in range(w)]
queue = [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]
for x, y in queue:
    visited[x][y] = True

while queue:
    x, y = queue.pop(0)
    r, g, b, a = pixels[x, y]
    if r > 235 and g > 235 and b > 235:
        pixels[x, y] = (0, 0, 0, 0)
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                visited[nx][ny] = True
                queue.append((nx, ny))

bbox = img.getbbox()
camera = img.crop(bbox)

def make_square_icon(size, pad_ratio=0.88, bg_color=(0,0,0,0)):
    out = Image.new('RGBA', (size, size), bg_color)
    max_w = int(size * pad_ratio)
    max_h = int(size * pad_ratio)
    
    scale = min(max_w / camera.width, max_h / camera.height)
    new_w = int(camera.width * scale)
    new_h = int(camera.height * scale)
    
    resized = camera.resize((new_w, new_h), Image.Resampling.LANCZOS)
    pos_x = (size - new_w) // 2
    pos_y = (size - new_h) // 2
    out.paste(resized, (pos_x, pos_y), resized)
    return out

# Generate files
icon_512 = make_square_icon(512, pad_ratio=0.92)
icon_512.save(os.path.join(icons_dir, 'icon-512.png'))

icon_192 = make_square_icon(192, pad_ratio=0.92)
icon_192.save(os.path.join(icons_dir, 'icon-192.png'))

icon_maskable = make_square_icon(512, pad_ratio=0.75, bg_color=(255, 255, 255, 255))
icon_maskable.save(os.path.join(icons_dir, 'icon-maskable.png'))

favicon_64 = make_square_icon(64, pad_ratio=0.95)
favicon_64.save(os.path.join(icons_dir, 'favicon.png'))

favicon_32 = make_square_icon(32, pad_ratio=0.95)
favicon_32.save(os.path.join(icons_dir, 'favicon-32.png'))

favicon_16 = make_square_icon(16, pad_ratio=0.95)
favicon_16.save(os.path.join(icons_dir, 'favicon-16.png'))

icon_512.save(os.path.join(os.getcwd(), 'public', 'favicon.ico'), format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
make_square_icon(256, pad_ratio=0.95).save(os.path.join(os.getcwd(), 'public', 'images', 'app-logo.png'))

print('Saved all icons from camera image')
