"""
KHRA PDF Auto-filler
- Text fields: overlay value after the colon
- Tick fields: white rectangle covers existing Malayalam options,
               then only selected value(s) written in bold green
"""

import sys, json, io, os, urllib.request
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONT_DIR = os.path.join(os.path.dirname(__file__), "fonts")
os.makedirs(FONT_DIR, exist_ok=True)

FONT_REGULAR = os.path.join(FONT_DIR, "NotoSansMalayalam-Regular.ttf")
FONT_BOLD    = os.path.join(FONT_DIR, "NotoSansMalayalam-Bold.ttf")

if not os.path.exists(FONT_REGULAR):
    urllib.request.urlretrieve(
        "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansMalayalam/NotoSansMalayalam-Regular.ttf",
        FONT_REGULAR)

if not os.path.exists(FONT_BOLD):
    urllib.request.urlretrieve(
        "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansMalayalam/NotoSansMalayalam-Bold.ttf",
        FONT_BOLD)
LATIN_BOLD   = "Helvetica-Bold"
LATIN_FONT   = "Helvetica"

PAGE_W = 612
PAGE_H = 1008

pdfmetrics.registerFont(TTFont("MalayalamRegular", FONT_REGULAR))
pdfmetrics.registerFont(TTFont("MalayalamBold", FONT_BOLD))

# Text fields: (x_value_start, y_pdfplumber, font_size)
TEXT_FIELDS = {
    "owner_name":             (290, 403, 11),
    "establishment_name":     (290, 423, 11),
    "establishment_address":  (290, 443, 11),
    "building_number":        (290, 463, 11),
    "ward":                   (290, 483, 11),
    "post_office":            (290, 503, 11),
    "taluk":                  (290, 523, 11),
    "district":               (290, 543, 11),
    "pincode":                (290, 563, 11),
   "phone_mobile":           (290, 583, 11),
"email":                  (290, 598, 11),
    "licence_receipt_number": (290, 623, 11),
    "fssai_licence":          (290, 643, 11),
    "owner_address":          (290, 663, 11),
    "year_established":       (290, 723, 11),
    "lodge_rooms":            (290, 861, 11),
    "seating_capacity":       (290, 899, 11),
}

# Tick fields:
# white_box = (x0, y0_plumber, x1, y1_plumber) — area to whiteout (all option rows)
# value_pos = (x, y_plumber, font_size)         — where to write selected value
TICK_FIELDS = {
    "establishment_type": {
        "white_box":  (290, 740, 572, 776),   # covers row 1 + row 2 of options
        "value_pos":  (290, 743, 10),
    },
    "role": {
        "white_box":  (290, 786, 572, 820),   # covers both role rows
        "value_pos":  (290, 789, 10),
    },
    "ac_status": {
        "white_box":  (290, 825, 572, 858),   # covers both AC rows
        "value_pos":  (290, 828, 10),
    },
    "restaurant_type": {
        "white_box":  (290, 877, 572, 896),   # covers veg/non-veg row
        "value_pos":  (290, 880, 10),
    },
}

def rl_y(y_plumber, fs=11):
    """pdfplumber top → reportlab bottom-left y"""
    return PAGE_H - y_plumber - fs - 2

def fill_pdf(form_data, input_pdf_path, output_pdf_path, photo_path=None):
    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=(PAGE_W, PAGE_H))

    # ── Text fields ────────────────────────────────────────────── 
    for key, (x, yp, fs) in TEXT_FIELDS.items():
        value = str(form_data.get(key, "")).strip()
        if value:
            c.setFont(LATIN_BOLD, fs)
            c.setFillColorRGB(0, 0, 0.55)
            c.drawString(x, rl_y(yp, fs), value)

    # ── Tick fields ──────────────────────────────────────────────
    for key, cfg in TICK_FIELDS.items():
        selected = form_data.get(key, [])
        if isinstance(selected, str):
            selected = [selected]

        # 1. White rectangle to erase existing Malayalam options
        x0, yp0, x1, yp1 = cfg["white_box"]
        # convert pdfplumber top-coords to reportlab rect (y grows up)
        rect_y  = PAGE_H - yp1   # bottom of rect in RL coords
        rect_h  = yp1 - yp0      # height
        rect_w  = x1 - x0
        c.setFillColorRGB(1, 1, 1)          # white
        c.setStrokeColorRGB(1, 1, 1)        # no border
        c.rect(x0, rect_y, rect_w, rect_h, fill=1, stroke=0)

        # 2. Write selected values (if any)
        if selected:
            vx, vyp, vfs = cfg["value_pos"]
            display = "  |  ".join(selected)
            c.setFont(LATIN_BOLD, vfs)
            c.setFillColorRGB(0, 0.35, 0)   # dark green
            c.drawString(vx, rl_y(vyp, vfs), display)

    # ── Photo ────────────────────────────────────────────────────
    px, pyp, pw, ph = 484, 162, 80, 90
    photo_rl_y = PAGE_H - pyp - ph
    if photo_path and os.path.exists(photo_path):
        try:
            c.drawImage(photo_path, px, photo_rl_y,
                        width=pw, height=ph,
                        preserveAspectRatio=True, mask='auto')
        except Exception as e:
            print(f"Warning: photo not embedded: {e}", file=sys.stderr)
    else:
        c.setStrokeColorRGB(0.6, 0.6, 0.6)
        c.setFillColorRGB(1, 1, 1)
        c.rect(px, photo_rl_y, pw, ph, fill=0, stroke=1)
        c.setFont(LATIN_FONT, 7)
        c.setFillColorRGB(0.6, 0.6, 0.6)
        c.drawCentredString(px + pw/2, photo_rl_y + ph/2, "[Photo]")

    c.save()
    packet.seek(0)

    # ── Merge overlay ────────────────────────────────────────────
    overlay  = PdfReader(packet)
    original = PdfReader(input_pdf_path)
    writer   = PdfWriter()

    page1 = original.pages[0]
    page1.merge_page(overlay.pages[0])
    writer.add_page(page1)

    if len(original.pages) > 1:
        writer.add_page(original.pages[1])

    with open(output_pdf_path, "wb") as f:
        writer.write(f)
    print(f"PDF written: {output_pdf_path}")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: fill_pdf.py '<json>' input.pdf output.pdf [photo]")
        sys.exit(1)
    data  = json.loads(sys.argv[1])
    photo = sys.argv[4] if len(sys.argv) > 4 else None
    fill_pdf(data, sys.argv[2], sys.argv[3], photo)
