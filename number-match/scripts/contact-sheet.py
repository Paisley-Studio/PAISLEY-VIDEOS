"""Tiles QA stills into one image (2 columns) for quick review.
Usage: python scripts/contact-sheet.py out/qa/PaisleyHTML out/qa/html-sheet.png"""
import sys, glob
from PIL import Image, ImageDraw
files = sorted(glob.glob(sys.argv[1] + "/*.png"))
w, h = 960, 540
cols = 2
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (w * cols, h * rows), "white")
for k, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((w, h))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 110, 28), fill="black")
    d.text((6, 6), f.split("\\")[-1].split("/")[-1], fill="white")
    sheet.paste(im, ((k % cols) * w, (k // cols) * h))
sheet.save(sys.argv[2])
print(sheet.size)
