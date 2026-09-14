"""像素光标生成器 —— 产出 public/cursors/ 下的 PNG。

为什么要有这个脚本:光标是**逐像素手绘**的资源,不是设计软件导出的。
没有生成器,这些 PNG 就是不可维护的二进制黑盒。

用法:
    python tools/gen-cursors.py              # 默认样式 B,写入 public/cursors/
    python tools/gen-cursors.py --style A
    python tools/gen-cursors.py --preview    # 只打印 ASCII 形状,不写文件

为什么是自绘而不是用现成素材:pixelarticons 官方有免费光标(风格与图标集
同源),但那是**独立产品**,免费页未声明许可,官方文档明确 Pro 包不许再分发。
本仓库是公开仓库,不能放许可不明的素材。故自绘,可自由使用。

环境:纯标准库(zlib + struct 手写 PNG 编码器),不依赖 Pillow。
"""

import argparse
import math
import os
import struct
import zlib

S = 32  # 网格尺寸。浏览器普遍只接受 ≤32×32 的 url 光标,所以定死 32。
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "cursors")

# ---- 调色板(与 main.css 的 @theme 令牌同源) ----
CREAM = (235, 235, 235, 255)
AMBER = (246, 193, 119, 255)
DARK = (13, 10, 18, 255)
GRAY = (155, 147, 168, 255)


def poly_fill(points):
    """扫描线多边形填充。step=1 的像素栅格,不用抗锯齿——像素图必须硬边。"""
    px = set()
    ys = [p[1] for p in points]
    for yi in range(int(min(ys)), int(max(ys)) + 1):
        yc = yi + 0.5
        xs = []
        for i in range(len(points)):
            x1, y1 = points[i]
            x2, y2 = points[(i + 1) % len(points)]
            if y1 == y2:
                continue
            lo, hi = (y1, y2) if y1 < y2 else (y2, y1)
            if lo <= yc < hi:
                xs.append(x1 + (yc - y1) / (y2 - y1) * (x2 - x1))
        xs.sort()
        for i in range(0, len(xs) - 1, 2):
            for xi in range(int(xs[i] + 0.5), int(xs[i + 1] - 0.5) + 1):
                if 0 <= xi < S and 0 <= yi < S:
                    px.add((xi, yi))
    return px


def union(*sets):
    out = set()
    for s in sets:
        out |= s
    return out


def dilate(shape):
    """8 邻域膨胀 —— 用来生成 1px 描边。"""
    return {(x + dx, y + dy) for x, y in shape for dx in (-1, 0, 1) for dy in (-1, 0, 1)}


# ---- 形状 ----
# 箭头轮廓 = 刀身三角(右缘 45°)+ 尾巴。经典指针的**缺口**在刀身与尾巴之间,
# 尾巴做细并右偏才有这个缺口;不然看着像个楔子,不像指针。
ARROW = union(
    poly_fill([(2, 2), (11, 11), (2, 12)]),
    poly_fill([(6, 10), (10, 10), (14, 20), (10, 20)]),
)

# I 型文本光标。竖干只有 3px,再窄就被 1px 描边吃掉了。
TEXT = union(
    poly_fill([(11, 5), (20, 5), (20, 8), (11, 8)]),
    poly_fill([(11, 24), (20, 24), (20, 27), (11, 27)]),
    poly_fill([(14, 7), (17, 7), (17, 25), (14, 25)]),
)

# 禁用态:细圆环 + 斜杠。环必须够细(壁厚 3px),否则中心被填满,就成了
# 「实心盘带一道缝」而不是那个符号。圆环类图形要按**视觉粗细**反推内外半径差。
CX = CY = 15.5
R_OUT, R_IN = 12.0, 9.0
NOT_ALLOWED = union(
    {(x, y) for x in range(S) for y in range(S) if R_IN <= math.hypot(x - CX, y - CY) <= R_OUT},
    {(x, y) for x in range(S) for y in range(S)
     if -1.5 <= (y - CY) + (x - CX) <= 1.5 and math.hypot(x - CX, y - CY) <= R_OUT + 0.5},
)

# ---- 样式集:(填充色, 描边色)。None 表示不描边 ----
STYLES = {
    "A": ("奶白实心 + 近黑描边", ARROW, (CREAM, DARK), (AMBER, DARK)),
    "B": ("空心:近黑填充 + 奶白描边(与 pixelarticons 的描边语言一致)",
          ARROW, (DARK, CREAM), (DARK, AMBER)),
    "C": ("无描边:纯奶白实心", ARROW, (CREAM, None), (AMBER, None)),
    "D": ("暖边:奶白实心 + 琥珀描边", ARROW, (CREAM, AMBER), (AMBER, CREAM)),
}
DEFAULT_STYLE = "B"


def compose(shape, fill, outline):
    """先铺描边再铺填充,得到 1px 轮廓包住实心体。"""
    grid = {}
    if outline:
        for p in dilate(shape) - shape:
            grid[p] = outline
    for p in shape:
        grid[p] = fill
    return grid


def write_png(path, grid):
    raw = bytearray()
    for y in range(S):
        raw.append(0)  # filter type 0 (None)
        for x in range(S):
            raw += bytes(grid.get((x, y), (0, 0, 0, 0)))

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", S, S, 8, 6, 0, 0, 0))  # 8bit RGBA
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)
    return len(png)


def hotspot(name, grid):
    """算热区坐标。热区写错会让点击位置整体偏移,比"不好看"严重得多,所以不手写。

    指针类:热区在**视觉尖端** —— 也就是图案的左上角极值像素。注意描边会把
    尖端顶出去 1px(填充尖端 (2,2) → 视觉尖端 (1,1)),所以必须按最终像素算,
    不能按形状定义里的坐标写。
    居中类(text / not-allowed):取外接框中心。
    """
    xs = [x for x, _ in grid]
    ys = [y for _, y in grid]
    if name in ("default", "pointer"):
        return min(xs), min(ys)
    return (min(xs) + max(xs)) // 2, (min(ys) + max(ys)) // 2


def ascii_art(grid, fill, x0, x1, y0, y1):
    """把像素打成 ASCII。井=填充,加=描边,点=透明 —— 用来在没有浏览器时核对形状。"""
    def mark(x, y):
        if (x, y) not in grid:
            return "."
        return "#" if grid[(x, y)] == fill else "+"

    return ["".join(mark(x, y) for x in range(x0, x1)) for y in range(y0, y1)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--style", default=DEFAULT_STYLE, choices=sorted(STYLES))
    ap.add_argument("--out", default=OUT_DIR)
    ap.add_argument("--preview", action="store_true", help="只打印形状,不写文件")
    args = ap.parse_args()

    desc, arrow, (d_fill, d_out), (p_fill, p_out) = STYLES[args.style]
    jobs = {
        "default": (arrow, d_fill, d_out),
        "pointer": (arrow, p_fill, p_out),
        "text": (TEXT, d_fill, d_out),
        # 禁用态用灰,而不是主题色:它是**语义信号**不是风格元素,
        # 刻意与其余三个拉开,让用户一眼看出"这里不可用"。
        "not-allowed": (NOT_ALLOWED, GRAY, DARK),
    }

    print(f"样式 {args.style}: {desc}")
    print()
    for name, (shape, fill, outline) in jobs.items():
        grid = compose(shape, fill, outline)
        hx, hy = hotspot(name, grid)
        if args.preview:
            xs = [x for x, _ in grid]
            ys = [y for _, y in grid]
            print(f"--- {name}  外接框 {min(xs)}..{max(xs)} × {min(ys)}..{max(ys)}  热区 {hx} {hy} ---")
            for line in ascii_art(grid, fill, min(xs), max(xs) + 1, min(ys), max(ys) + 1):
                print("   " + line)
            print()
            continue
        os.makedirs(args.out, exist_ok=True)
        size = write_png(os.path.join(args.out, f"{name}.png"), grid)
        print(f"  写出 {name}.png  {size} bytes  热区 {hx} {hy}")

    if not args.preview:
        print()
        print("把上面各行的热区同步到 main.css 的 cursor 规则(必须一致,否则点击点会偏)。")


if __name__ == "__main__":
    main()
