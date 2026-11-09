"""
Generates all Water Shell brand icons, splash screens, favicons, and Android launcher assets
from the user-provided official Water Shell logo with the official leaf-droplet emblem
and tagline "Pure Water, Pure Life".
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFont

SRC_PATH = r"C:\Users\shubh\.gemini\antigravity-ide\brain\6f349b2f-dc56-4113-abba-c1159526b8f4\.user_uploaded\media_1793339696072.jpg"
MOBILE_DIR = r"E:\WaterPurifierCommerce\mobile"
ADMIN_DIR = r"E:\WaterPurifierCommerce\admin"

# 1. Load source image
src_bgr = cv2.imread(SRC_PATH)
if src_bgr is None:
    raise FileNotFoundError(f"Source image not found at {SRC_PATH}")

h, w = src_bgr.shape[:2]

# 2. Extract tight bounding box of logo content
diff = np.max(255 - src_bgr, axis=2)
mask = diff > 10
ys, xs = np.where(mask)
ymin = max(0, ys.min() - 2)
ymax = min(h - 1, ys.max() + 2)
xmin = max(0, xs.min() - 2)
xmax = min(w - 1, xs.max() + 2)

cropped_bgr = src_bgr[ymin:ymax+1, xmin:xmax+1]
ch, cw = cropped_bgr.shape[:2]
print(f"Cropped logo size: {cw}x{ch}")

# Convert to RGB PIL Image
cropped_rgb = cv2.cvtColor(cropped_bgr, cv2.COLOR_BGR2RGB)

# 3. Create a clean transparent version
arr = cropped_rgb.astype(np.float32)
dist_from_white = np.max(255.0 - arr, axis=2)
alpha = np.clip((dist_from_white - 4.0) / 36.0 * 255.0, 0, 255).astype(np.uint8)

# Un-premultiply RGB so edges don't have white fringes
alpha_float = alpha.astype(np.float32) / 255.0
alpha_safe = np.maximum(alpha_float, 0.001)[:, :, np.newaxis]
rgb_clean = np.clip((arr - (1.0 - alpha_safe) * 255.0) / alpha_safe, 0, 255).astype(np.uint8)

transparent_arr = np.dstack((rgb_clean, alpha))
transparent_logo = Image.fromarray(transparent_arr, mode='RGBA')
print("Created anti-aliased transparent logo.")

# Helper to draw spaced text for high-end luxury tagline typography
def measure_spaced_text(draw, text, font, tracking=2):
    total_w = 0
    for char in text:
        bbox = draw.textbbox((0, 0), char, font=font)
        total_w += (bbox[2] - bbox[0]) + tracking
    return total_w - tracking

def draw_spaced_text(draw, text, font, fill, x, y, tracking=2):
    cur_x = x
    for char in text:
        draw.text((cur_x, y), char, font=font, fill=fill)
        bbox = draw.textbbox((cur_x, y), char, font=font)
        char_w = bbox[2] - bbox[0]
        cur_x += char_w + tracking

# 4. Create Integrated Water Shell Logo with Tagline "Pure Water, Pure Life"
# Font: Segoe UI Bold (or Arial Bold fallback)
font_path = r"C:\Windows\Fonts\segoeuib.ttf"
if not os.path.exists(font_path):
    font_path = r"C:\Windows\Fonts\arialbd.ttf"
tagline_font = ImageFont.truetype(font_path, 38)

tagline_text = "Pure Water, Pure Life"
extra_bottom_h = 76
combined_w = cw
combined_h = ch + extra_bottom_h

combined_logo = Image.new('RGBA', (combined_w, combined_h), (0, 0, 0, 0))
combined_logo.paste(transparent_logo, (0, 0), transparent_logo)

draw_comb = ImageDraw.Draw(combined_logo)
tw = measure_spaced_text(draw_comb, tagline_text, tagline_font, tracking=3)
tx = (combined_w - tw) // 2
ty = ch + 20
# Forest Green matching 'SHELL': #2E8B57 => (46, 139, 87)
draw_comb_color = (46, 139, 87, 255)
draw_spaced_text(draw_comb, tagline_text, tagline_font, draw_comb_color, tx, ty, tracking=3)
print(f"Created integrated logo with tagline: {combined_w}x{combined_h}")

# 5. Generate App Icon (icon.png: 1024x1024)
# On a crisp pure white background, place the emblem and wordmark centered
# Safe area: 680px ensures it fits both iOS squircle and Android circular masks
def make_square_icon(content_img, size=1024, max_content_dim=680, bg_color=(255, 255, 255, 255)):
    canvas = Image.new('RGBA', (size, size), bg_color)
    scale = max_content_dim / max(content_img.width, content_img.height)
    target_w = int(content_img.width * scale)
    target_h = int(content_img.height * scale)
    scaled = content_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    pos_x = (size - target_w) // 2
    pos_y = (size - target_h) // 2
    canvas.paste(scaled, (pos_x, pos_y), scaled)
    return canvas

# Standard launcher icon (emblem + wordmark + tagline fits perfectly in 680px)
icon_1024 = make_square_icon(combined_logo, 1024, max_content_dim=680)
icon_path = os.path.join(MOBILE_DIR, "assets", "images", "icon.png")
icon_1024.save(icon_path, "PNG")
print(f"Saved {icon_path}")

# Also save to admin/public and admin/src/assets
admin_icon_path = os.path.join(ADMIN_DIR, "public", "aquapure-icon.png")
icon_1024.save(admin_icon_path, "PNG")
print(f"Saved {admin_icon_path}")

admin_src_icon_path = os.path.join(ADMIN_DIR, "src", "assets", "aquapure-icon.png")
icon_1024.save(admin_src_icon_path, "PNG")
print(f"Saved {admin_src_icon_path}")

# 6. Generate Android Adaptive Foreground (android-icon-foreground.png: 1024x1024)
# Safe circle zone for Android adaptive icons is center 66% (radius 338px => 640px diameter)
fg_1024 = make_square_icon(combined_logo, 1024, max_content_dim=580, bg_color=(0, 0, 0, 0))
fg_path = os.path.join(MOBILE_DIR, "assets", "images", "android-icon-foreground.png")
fg_1024.save(fg_path, "PNG")
print(f"Saved {fg_path}")

# 7. Generate Android Adaptive Background (android-icon-background.png: 1024x1024)
# Pure white solid background
bg_1024 = Image.new('RGBA', (1024, 1024), (255, 255, 255, 255))
bg_path = os.path.join(MOBILE_DIR, "assets", "images", "android-icon-background.png")
bg_1024.save(bg_path, "PNG")
print(f"Saved {bg_path}")

# 8. Generate Android Monochrome Icon (android-icon-monochrome.png: 1024x1024)
# Used for Android 13+ themed icons and notifications: white silhouette with alpha
mono_arr = np.zeros((1024, 1024, 4), dtype=np.uint8)
fg_alpha = np.array(fg_1024)[:, :, 3]
mono_arr[:, :, 0] = 255
mono_arr[:, :, 1] = 255
mono_arr[:, :, 2] = 255
mono_arr[:, :, 3] = fg_alpha
mono_pil = Image.fromarray(mono_arr, mode='RGBA')
mono_path = os.path.join(MOBILE_DIR, "assets", "images", "android-icon-monochrome.png")
mono_pil.save(mono_path, "PNG")
print(f"Saved {mono_path}")

# 9. Generate aquapure-logo.png & splash-icon.png (612x408 - exactly 1.5 aspect ratio = 3:2)
# Centered with optimal breathing room and zero distortion
def make_aspect_logo(content_img, target_w=612, target_h=408, max_content_h=370, max_content_w=550):
    canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
    scale = min(max_content_h / content_img.height, max_content_w / content_img.width)
    nw = int(content_img.width * scale)
    nh = int(content_img.height * scale)
    scaled = content_img.resize((nw, nh), Image.Resampling.LANCZOS)
    px = (target_w - nw) // 2
    py = (target_h - nh) // 2
    canvas.paste(scaled, (px, py), scaled)
    return canvas

logo_612 = make_aspect_logo(combined_logo, 612, 408, max_content_h=370, max_content_w=550)
logo_path = os.path.join(MOBILE_DIR, "assets", "images", "aquapure-logo.png")
logo_612.save(logo_path, "PNG")
print(f"Saved {logo_path}")

splash_icon_path = os.path.join(MOBILE_DIR, "assets", "images", "splash-icon.png")
logo_612.save(splash_icon_path, "PNG")
print(f"Saved {splash_icon_path}")

# Also save to admin/public and admin/src/assets
admin_logo_path = os.path.join(ADMIN_DIR, "public", "aquapure-logo.png")
logo_612.save(admin_logo_path, "PNG")
print(f"Saved {admin_logo_path}")

admin_src_logo_path = os.path.join(ADMIN_DIR, "src", "assets", "aquapure-logo.png")
logo_612.save(admin_src_logo_path, "PNG")
print(f"Saved {admin_src_logo_path}")

# 10. Generate favicon.png (64x64)
# Clean favicon on white rounded canvas
def make_favicon(content_img, size=64):
    canvas = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    scale = (size - 8) / max(content_img.width, content_img.height)
    nw = int(content_img.width * scale)
    nh = int(content_img.height * scale)
    scaled = content_img.resize((nw, nh), Image.Resampling.LANCZOS)
    px = (size - nw) // 2
    py = (size - nh) // 2
    canvas.paste(scaled, (px, py), scaled)
    return canvas

favicon_64 = make_favicon(combined_logo, 64)
favicon_path = os.path.join(MOBILE_DIR, "assets", "images", "favicon.png")
favicon_64.save(favicon_path, "PNG")
print(f"Saved {favicon_path}")

# 11. Generate Android Native Mipmap Assets
MIPMAP_CONFIGS = {
    "mipmap-mdpi": {"launcher": 48, "foreground": 108},
    "mipmap-hdpi": {"launcher": 72, "foreground": 162},
    "mipmap-xhdpi": {"launcher": 96, "foreground": 216},
    "mipmap-xxhdpi": {"launcher": 144, "foreground": 324},
    "mipmap-xxxhdpi": {"launcher": 192, "foreground": 432},
}

res_root = os.path.join(MOBILE_DIR, "android", "app", "src", "main", "res")

for folder, dims in MIPMAP_CONFIGS.items():
    folder_path = os.path.join(res_root, folder)
    os.makedirs(folder_path, exist_ok=True)
    l_size = dims["launcher"]
    fg_size = dims["foreground"]

    # 1. ic_launcher.webp (Square launcher on white)
    launcher_img = Image.new('RGBA', (l_size, l_size), (255, 255, 255, 255))
    scale = (l_size * 0.78) / max(combined_logo.width, combined_logo.height)
    nw = int(combined_logo.width * scale)
    nh = int(combined_logo.height * scale)
    scaled = combined_logo.resize((nw, nh), Image.Resampling.LANCZOS)
    launcher_img.paste(scaled, ((l_size - nw) // 2, (l_size - nh) // 2), scaled)
    launcher_img.save(os.path.join(folder_path, "ic_launcher.webp"), "WEBP")

    # 2. ic_launcher_round.webp (Circular launcher on white)
    round_mask = Image.new('L', (l_size, l_size), 0)
    draw = ImageDraw.Draw(round_mask)
    draw.ellipse((0, 0, l_size - 1, l_size - 1), fill=255)
    round_img = Image.new('RGBA', (l_size, l_size), (255, 255, 255, 0))
    white_circle = Image.new('RGBA', (l_size, l_size), (255, 255, 255, 255))
    round_img.paste(white_circle, (0, 0), round_mask)
    round_img.paste(scaled, ((l_size - nw) // 2, (l_size - nh) // 2), scaled)
    round_final = Image.new('RGBA', (l_size, l_size), (0, 0, 0, 0))
    round_final.paste(round_img, (0, 0), round_mask)
    round_final.save(os.path.join(folder_path, "ic_launcher_round.webp"), "WEBP")

    # 3. ic_launcher_foreground.webp (Transparent, content in safe 66% circle)
    fg_img = Image.new('RGBA', (fg_size, fg_size), (0, 0, 0, 0))
    scale_fg = (fg_size * 0.58) / max(combined_logo.width, combined_logo.height)
    nfw = int(combined_logo.width * scale_fg)
    nfh = int(combined_logo.height * scale_fg)
    scaled_fg = combined_logo.resize((nfw, nfh), Image.Resampling.LANCZOS)
    fg_img.paste(scaled_fg, ((fg_size - nfw) // 2, (fg_size - nfh) // 2), scaled_fg)
    fg_img.save(os.path.join(folder_path, "ic_launcher_foreground.webp"), "WEBP")

    # 4. ic_launcher_background.webp (Solid white)
    bg_img = Image.new('RGBA', (fg_size, fg_size), (255, 255, 255, 255))
    bg_img.save(os.path.join(folder_path, "ic_launcher_background.webp"), "WEBP")

    # 5. ic_launcher_monochrome.webp (White alpha silhouette)
    fg_alpha_sub = np.array(fg_img)[:, :, 3]
    mono_sub = np.zeros((fg_size, fg_size, 4), dtype=np.uint8)
    mono_sub[:, :, 0] = 255
    mono_sub[:, :, 1] = 255
    mono_sub[:, :, 2] = 255
    mono_sub[:, :, 3] = fg_alpha_sub
    Image.fromarray(mono_sub, mode='RGBA').save(os.path.join(folder_path, "ic_launcher_monochrome.webp"), "WEBP")

    print(f"Generated mipmap in {folder}")

# 12. Generate Android Native Drawables (splashscreen_logo.png and notification_icon.png)
DRAWABLE_CONFIGS = {
    "drawable-mdpi": {"splash": 288, "notif": 24},
    "drawable-hdpi": {"splash": 432, "notif": 36},
    "drawable-xhdpi": {"splash": 576, "notif": 48},
    "drawable-xxhdpi": {"splash": 864, "notif": 72},
    "drawable-xxxhdpi": {"splash": 1152, "notif": 96},
}

for folder, dims in DRAWABLE_CONFIGS.items():
    folder_path = os.path.join(res_root, folder)
    os.makedirs(folder_path, exist_ok=True)
    splash_sz = dims["splash"]
    notif_sz = dims["notif"]

    # Splashscreen logo (scaled to fit within square canvas with breathing room)
    splash_logo = Image.new('RGBA', (splash_sz, splash_sz), (0, 0, 0, 0))
    scale_splash = (splash_sz * 0.78) / max(combined_logo.width, combined_logo.height)
    sw = int(combined_logo.width * scale_splash)
    sh = int(combined_logo.height * scale_splash)
    scaled_splash = combined_logo.resize((sw, sh), Image.Resampling.LANCZOS)
    splash_logo.paste(scaled_splash, ((splash_sz - sw) // 2, (splash_sz - sh) // 2), scaled_splash)
    splash_logo.save(os.path.join(folder_path, "splashscreen_logo.png"), "PNG")

    # Notification icon (pure white silhouette with alpha)
    notif_img = Image.new('RGBA', (notif_sz, notif_sz), (0, 0, 0, 0))
    scale_notif = (notif_sz - 4) / max(transparent_logo.width, transparent_logo.height)
    nw = int(transparent_logo.width * scale_notif)
    nh = int(transparent_logo.height * scale_notif)
    scaled_notif = transparent_logo.resize((nw, nh), Image.Resampling.LANCZOS)
    notif_alpha = np.array(scaled_notif)[:, :, 3]
    white_notif = np.zeros((nh, nw, 4), dtype=np.uint8)
    white_notif[:, :, 0] = 255
    white_notif[:, :, 1] = 255
    white_notif[:, :, 2] = 255
    white_notif[:, :, 3] = notif_alpha
    notif_pil = Image.fromarray(white_notif, mode='RGBA')
    notif_img.paste(notif_pil, ((notif_sz - nw) // 2, (notif_sz - nh) // 2), notif_pil)
    notif_img.save(os.path.join(folder_path, "notification_icon.png"), "PNG")

    print(f"Generated drawables in {folder}")

print("\nSUCCESS: ALL WATER SHELL ICONS, LOGOS, AND SPLASH ASSETS WITH TAGLINE GENERATED!")
