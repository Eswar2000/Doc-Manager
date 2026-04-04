from typing import Optional, Dict, Any, Optional
from playwright.async_api import async_playwright

async def html_to_pdf_bytes(html: str, title: Optional[str] = None, pdf_options: Optional[Dict[str, Any]] = None, extra_css: Optional[str] = None) -> bytes:
    default_css = """
    body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; color: #111; }
    .contract { max-width: 780px; margin: 0 auto; }
    h1 { font-size: 18pt; margin-bottom: 8px; }
    p { line-height: 1.4; margin: 6px 0; }
    """

    # Table styles adapted from frontend `App.css`, scoped under .contract
    table_css = """
    .contract table {
        width: 100%;
        border-collapse: collapse !important;
        table-layout: fixed !important;
        margin: 1.5em 0;
        line-height: 1.5;
        text-align: left;
    }

    .contract th,
    .contract td {
        min-width: 60px;
        padding: 4px 8px;
        border: 1px solid #d0d7de;
        white-space: break-word;
    }

    .contract th {
        background-color: #f6f8fa;
        font-weight: 600;
        color: #1f2328;
    }

    .contract td { background-color: #ffffff; }

    .contract tr:nth-child(even) td { background-color: #fbfbfc; }

    .contract td[data-align="right"],
    .contract th[data-align="right"] { text-align: right; }
    .contract td[data-align="center"],
    .contract th[data-align="center"] { text-align: center; }
    """

    header_template = "<div style='width:100%;font-size:10px;color:#666;text-align:center;'>" + (title or "") + "</div>"
    footer_template = "<div style='width:100%;font-size:10px;color:#666;text-align:center;'><span class='pageNumber'></span> / <span class='totalPages'></span></div>"

    # Build final HTML with scoped styles
    styles = default_css + table_css + (extra_css or "")
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