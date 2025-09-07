"""
QR Code generator for the clinic website.

This script creates PNG and SVG QR codes that point to:
  https://acuhealthmaster.co.uk

It is standalone and does not affect deployment/Render. It does NOT
modify requirements.txt. Install dependencies locally if needed.

Usage:
  python tools/generate_qr.py

Optional flags:
  --url https://example.com        Override URL
  --png qr_site.png                PNG output path (default: qr_acuhealthmaster.png)
  --svg qr_site.svg                SVG output path (default: qr_acuhealthmaster.svg)
  --box-size 10                    Pixel size of each QR box
  --border 4                       Border boxes around the QR

Dependencies (local only):
  pip install "qrcode[pil]"
  # For SVG support (optional): no extra install required; uses qrcode's svg factory
"""

from __future__ import annotations

import argparse
import sys


DEFAULT_URL = "https://acuhealthmaster.co.uk"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Generate QR codes for a website URL.")
    parser.add_argument("--url", default=DEFAULT_URL, help="Target URL to encode")
    parser.add_argument("--png", default="qr_acuhealthmaster.png", help="PNG output filepath")
    parser.add_argument("--svg", default="qr_acuhealthmaster.svg", help="SVG output filepath")
    parser.add_argument("--box-size", type=int, default=10, help="Size of each QR box in pixels")
    parser.add_argument("--border", type=int, default=4, help="Border size (boxes)")

    args = parser.parse_args(argv)

    try:
        import qrcode
        from qrcode.constants import ERROR_CORRECT_Q
        from qrcode.image.svg import SvgImage
    except Exception as e:
        print("ERROR: Missing dependency 'qrcode'. Install locally with:", file=sys.stderr)
        print("       pip install \"qrcode[pil]\"", file=sys.stderr)
        print(f"Details: {e}", file=sys.stderr)
        return 1

    # Configure QR
    qr = qrcode.QRCode(
        version=None,  # automatic
        error_correction=ERROR_CORRECT_Q,  # ~25% recovery
        box_size=args.box_size,
        border=args.border,
    )
    qr.add_data(args.url)
    qr.make(fit=True)

    # PNG output
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(args.png)

    # SVG output
    svg_img = qr.make_image(image_factory=SvgImage)
    svg_img.save(args.svg)

    print(f"Generated: {args.png}")
    print(f"Generated: {args.svg}")
    print(f"URL: {args.url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

