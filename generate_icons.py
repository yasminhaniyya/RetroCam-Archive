from PIL import Image, ImageDraw, ImageFont
import os

icons_dir = os.path.join(os.getcwd(), 'public', 'icons')
os.makedirs(icons_dir, exist_ok=True)

def create_retro_icon(size):
    # Create RGBA image with rounded aesthetic dark theme
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Outer background rounded rectangle with subtle warm border
    bg_color = (20, 22, 28, 255)       # Dark graphite
    accent_gold = (224, 122, 95, 255)   # Terracotta / warm retro orange
    accent_amber = (244, 162, 97, 255)  # Warm amber
    border_color = (60, 64, 76, 255)
    
    # Corner radius
    radius = int(size * 0.22)
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=bg_color)
    draw.rounded_rectangle([2, 2, size-2, size-2], radius=radius, outline=border_color, width=max(1, int(size * 0.02)))
    
    # Camera body outline
    cam_left = int(size * 0.18)
    cam_top = int(size * 0.32)
    cam_right = int(size * 0.82)
    cam_bottom = int(size * 0.78)
    cam_radius = int(size * 0.08)
    
    # Rangefinder prism / top plate bump
    bump_left = int(size * 0.28)
    bump_top = int(size * 0.22)
    bump_right = int(size * 0.52)
    bump_bottom = int(size * 0.34)
    draw.rounded_rectangle([bump_left, bump_top, bump_right, bump_bottom], radius=int(size * 0.04), fill=(40, 44, 54, 255))
    
    # Shutter button on top right
    shut_left = int(size * 0.64)
    shut_top = int(size * 0.25)
    shut_right = int(size * 0.76)
    shut_bottom = int(size * 0.33)
    draw.rounded_rectangle([shut_left, shut_top, shut_right, shut_bottom], radius=int(size * 0.02), fill=accent_amber)

    # Main camera body
    draw.rounded_rectangle([cam_left, cam_top, cam_right, cam_bottom], radius=cam_radius, fill=(30, 33, 42, 255), outline=accent_gold, width=max(2, int(size * 0.025)))

    # Grip leatherette texture band
    grip_left = cam_left + int(size * 0.03)
    grip_top = cam_top + int(size * 0.06)
    grip_right = cam_left + int(size * 0.18)
    grip_bottom = cam_bottom - int(size * 0.06)
    draw.rounded_rectangle([grip_left, grip_top, grip_right, grip_bottom], radius=int(size * 0.03), fill=(22, 24, 30, 255))

    # Center Lens assembly
    lens_cx = int(size * 0.52)
    lens_cy = int(size * 0.55)
    lens_r_outer = int(size * 0.19)
    lens_r_mid = int(size * 0.15)
    lens_r_inner = int(size * 0.09)
    lens_r_core = int(size * 0.04)

    # Lens outer rim (brass/orange)
    draw.ellipse([lens_cx - lens_r_outer, lens_cy - lens_r_outer, lens_cx + lens_r_outer, lens_cy + lens_r_outer], fill=(45, 48, 60, 255), outline=accent_amber, width=max(2, int(size * 0.02)))
    # Lens mid ring
    draw.ellipse([lens_cx - lens_r_mid, lens_cy - lens_r_mid, lens_cx + lens_r_mid, lens_cy + lens_r_mid], fill=(15, 17, 22, 255), outline=(90, 95, 110, 255), width=max(1, int(size * 0.015)))
    # Glass element with reflection
    draw.ellipse([lens_cx - lens_r_inner, lens_cy - lens_r_inner, lens_cx + lens_r_inner, lens_cy + lens_r_inner], fill=(18, 50, 70, 255), outline=accent_gold, width=max(1, int(size * 0.015)))
    # Core aperture
    draw.ellipse([lens_cx - lens_r_core, lens_cy - lens_r_core, lens_cx + lens_r_core, lens_cy + lens_r_core], fill=(6, 12, 20, 255))
    # Glass flare highlight
    flare_x = lens_cx - int(lens_r_inner * 0.45)
    flare_y = lens_cy - int(lens_r_inner * 0.45)
    flare_r = max(2, int(size * 0.025))
    draw.ellipse([flare_x - flare_r, flare_y - flare_r, flare_x + flare_r, flare_y + flare_r], fill=(255, 255, 255, 200))

    # Red dot / sensor badge
    dot_x = int(size * 0.73)
    dot_y = int(size * 0.40)
    dot_r = max(2, int(size * 0.022))
    draw.ellipse([dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r], fill=(220, 40, 40, 255))

    return img

icon_192 = create_retro_icon(192)
icon_192.save(os.path.join(icons_dir, 'icon-192.png'))
print('Saved icon-192.png')

icon_512 = create_retro_icon(512)
icon_512.save(os.path.join(icons_dir, 'icon-512.png'))
print('Saved icon-512.png')

icon_maskable = create_retro_icon(512)
icon_maskable.save(os.path.join(icons_dir, 'icon-maskable.png'))
print('Saved icon-maskable.png')

# Save favicon
favicon = create_retro_icon(64)
favicon.save(os.path.join(os.getcwd(), 'public', 'favicon.ico'))
favicon.save(os.path.join(icons_dir, 'favicon.png'))
print('Saved favicon.ico and favicon.png')
