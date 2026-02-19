"""
OGP用PNG画像を生成するスクリプト（Pillowなし／zlib+png形式で直接生成）
"""
import struct
import zlib

def create_png(width, height, pixels):
    """ピクセルデータからPNGバイト列を生成する（RGBA方式）"""
    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xffffffff)

    signature = b'\x89PNG\r\n\x1a\n'
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)  # 8bit RGB
    ihdr = make_chunk(b'IHDR', ihdr_data)
    # IDAT
    raw_data = b''
    for row in pixels:
        raw_data += b'\x00'  # フィルタタイプ None
        for r, g, b in row:
            raw_data += bytes([r, g, b])
    compressed = zlib.compress(raw_data, 9)
    idat = make_chunk(b'IDAT', compressed)
    # IEND
    iend = make_chunk(b'IEND', b'')
    return signature + ihdr + idat + iend

def hex_to_rgb(hex_color):
    """16進数カラーをRGBタプルに変換"""
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

# --- 画像サイズ ---
W, H = 1200, 630

# --- カラーパレット ---
BG     = hex_to_rgb('1a1a2e')   # ダークネイビー背景
BG2    = hex_to_rgb('16213e')   # やや明るいネイビー
GOLD   = hex_to_rgb('c9a84c')   # ゴールド
GOLD2  = hex_to_rgb('e8c97a')   # 明るいゴールド
WHITE  = hex_to_rgb('e0e0e0')   # テキスト白

# ピクセルバッファを初期化（グラデーション背景）
pixels = []
for y in range(H):
    row = []
    t = y / H
    r = int(BG[0] * (1 - t) + BG2[0] * t)
    g = int(BG[1] * (1 - t) + BG2[1] * t)
    b = int(BG[2] * (1 - t) + BG2[2] * t)
    for x in range(W):
        row.append((r, g, b))
    pixels.append(row)

def draw_rect(pixels, x, y, w, h, color):
    """矩形を描画する"""
    for dy in range(h):
        for dx in range(w):
            if 0 <= y+dy < H and 0 <= x+dx < W:
                pixels[y+dy][x+dx] = color

def draw_border(pixels, x, y, w, h, color, thickness=2):
    """境界線を描画する"""
    draw_rect(pixels, x, y, w, thickness, color)          # 上
    draw_rect(pixels, x, y+h-thickness, w, thickness, color)  # 下
    draw_rect(pixels, x, y, thickness, h, color)          # 左
    draw_rect(pixels, x+w-thickness, y, thickness, h, color)  # 右

# ゴールドの枠を描画
draw_border(pixels, 20, 20, W-40, H-40, GOLD, 2)
draw_border(pixels, 24, 24, W-48, H-48, GOLD, 1)

# 中央に水平区切り線
draw_rect(pixels, 80, H//2 - 10, W-160, 1, GOLD)
draw_rect(pixels, 80, H//2 + 60, W-160, 1, GOLD)

# 装飾: 左右にアクセントブロック
for i in range(5):
    draw_rect(pixels, 50, H//2 - 80 + i*30, 12, 18, GOLD)
    draw_rect(pixels, W-62, H//2 - 80 + i*30, 12, 18, GOLD)

# --- テキストブロックの代替として横線でテキスト領域を表現 ---
# (フォントレンダリングなしのため、ブロックでテキストを模倣)
# タイトル「13th Age」— 大きなゴールドブロック
title_y = H//2 - 120
title_h = 80
digit_w = 60
gap = 10

# "13" のビットマップ風描画（簡易）
def draw_block_text(pixels, x, y, text_blocks, color, scale=8):
    """ブロックパターンでテキストを描画する（ドット絵風）"""
    cx = x
    for char in text_blocks:
        for row_idx, row in enumerate(char):
            for col_idx, pixel in enumerate(row):
                if pixel:
                    draw_rect(pixels, cx + col_idx*scale, y + row_idx*scale,
                              scale-1, scale-1, color)
        cx += (len(char[0]) + 1) * scale

# 数字と文字のビットマップパターン（5x7グリッド）
PATTERNS = {
    '1': [
        [0,0,1,0,0],
        [0,1,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,1,1,1,0],
    ],
    '3': [
        [1,1,1,1,0],
        [0,0,0,1,1],
        [0,0,0,1,1],
        [0,1,1,1,0],
        [0,0,0,1,1],
        [0,0,0,1,1],
        [1,1,1,1,0],
    ],
    'T': [
        [1,1,1,1,1],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
    ],
    'H': [
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
    ],
    'A': [
        [0,0,1,0,0],
        [0,1,0,1,0],
        [1,0,0,0,1],
        [1,1,1,1,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
    ],
    'G': [
        [0,1,1,1,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,1,1,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [0,1,1,1,0],
    ],
    'E': [
        [1,1,1,1,1],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,1,1,1,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,1,1,1,1],
    ],
    'h': [
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
    ],
    'S': [
        [0,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,0],
        [0,1,1,1,0],
        [0,0,0,0,1],
        [1,0,0,0,1],
        [0,1,1,1,0],
    ],
    ' ': [
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0],
    ],
    'C': [
        [0,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,1],
        [0,1,1,1,0],
    ],
    'R': [
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0],
        [1,0,1,0,0],
        [1,0,0,1,0],
        [1,0,0,0,1],
    ],
    'I': [
        [1,1,1],
        [0,1,0],
        [0,1,0],
        [0,1,0],
        [0,1,0],
        [0,1,0],
        [1,1,1],
    ],
    'B': [
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0],
    ],
    'U': [
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [0,1,1,1,0],
    ],
    'L': [
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,1,1,1,1],
    ],
    'D': [
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0],
    ],
    'N': [
        [1,0,0,0,1],
        [1,1,0,0,1],
        [1,0,1,0,1],
        [1,0,0,1,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
    ],
}

# タイトル「13th Age」を描画（スケール10）
title_chars = [PATTERNS[c] for c in '13']
title_x = W//2 - (len('13') * 6 + 1) * 10 // 2 - 300
draw_block_text(pixels, 200, H//2 - 140, title_chars, GOLD2, scale=10)

# 間のスペースと「th」
sub_chars = [PATTERNS['T'], PATTERNS['H']]
draw_block_text(pixels, 360, H//2 - 110, sub_chars, GOLD, scale=6)

# 「AGE」
age_chars = [PATTERNS['A'], PATTERNS['G'], PATTERNS['E']]
draw_block_text(pixels, 320, H//2 - 140, age_chars, GOLD2, scale=10)

# サブタイトル「CHARACTER BUILDER」
sub_title = [PATTERNS[c] for c in 'CHARACTER']
draw_block_text(pixels, 120, H//2 + 20, sub_title, WHITE, scale=6)

sub_title2 = [PATTERNS[c] for c in 'BUILDER']
draw_block_text(pixels, 260, H//2 + 80, sub_title2, GOLD, scale=6)

# PNG生成・保存
png_bytes = create_png(W, H, pixels)
with open('img/ogp.png', 'wb') as f:
    f.write(png_bytes)
print(f"生成完了: img/ogp.png ({W}x{H})")
