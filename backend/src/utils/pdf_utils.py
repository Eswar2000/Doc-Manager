from typing import Optional, Dict, Any, Optional
from playwright.async_api import async_playwright

async def html_to_pdf_bytes(html: str, title: Optional[str] = None, pdf_options: Optional[Dict[str, Any]] = None, extra_css: Optional[str] = None) -> bytes:
    default_css = """
    body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; color: #111; }
    .contract { max-width: 780px; margin: 0 auto; }
    h1 { font-size: 18pt; margin-bottom: 8px; }
    p { line-height: 1.4; margin: 6px 0; }
    """

    header_template = "<div style='width:100%;font-size:10px;color:#666;text-align:center;'>" + (title or "") + "</div>"
    footer_template = "<div style='width:100%;font-size:10px;color:#666;text-align:center;'><span class='pageNumber'></span> / <span class='totalPages'></span></div>"

    # Build final HTML
    styles = default_css + (extra_css or "")
    final_html = f"<html><head><meta charset='utf-8'><style>{styles}</style></head><body><div class='contract'>{html}</div></body></html>"

    opts = {
        "format": "A4",
        "print_background": True,
        "margin": {"top": "20mm", "bottom": "20mm", "left": "18mm", "right": "18mm"},
        "display_header_footer": True,
        "header_template": header_template,
        "footer_template": footer_template,
    }
    if pdf_options:
        opts.update(pdf_options)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        context = await browser.new_context()
        page = await context.new_page()
        await page.set_content(final_html, wait_until="networkidle")
        pdf_bytes = await page.pdf(**opts)
        await browser.close()

    return pdf_bytes