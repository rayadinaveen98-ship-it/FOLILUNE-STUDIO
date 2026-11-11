"""Real Chromium restart test: no IndexedDB mocks. Run on unrestricted host/CI."""
import os
import tempfile
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def visit(p, url, profile, first):
    opts = dict(user_data_dir=profile, headless=True, args=['--no-sandbox'], accept_downloads=True)
    if os.environ.get('CHROMIUM_EXECUTABLE'):
        opts['executable_path'] = os.environ['CHROMIUM_EXECUTABLE']
    ctx = p.chromium.launch_persistent_context(**opts)
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(url, wait_until='domcontentloaded', timeout=20000)
    page.get_by_role('heading', name='A world worth creating.').wait_for(timeout=15000)
    if first:
        page.get_by_role('button', name='New creation').click()
        page.locator('#newTitle').fill('FOLILUNE Genuine Recovery')
        page.locator('#newForm button[type=submit]').click()
        page.locator('#sectionBody').fill('Chapter one — తెలుగు after restart')
        page.locator('[data-action=addSection]').click()
        page.locator('#sectionBody').fill('Chapter two survives restart')
        page.get_by_role('button', name='Save', exact=True).click()
        page.locator('#saveState').get_by_text('Saved locally').wait_for()
        page.evaluate("document.querySelector('[data-nav=settings]').click()")
        page.locator('[data-action=startRecovery]').click()
        page.get_by_text('Probe saved and read back.', exact=False).wait_for()
    else:
        page.evaluate("document.querySelector('[data-nav=settings]').click()")
        page.locator('[data-action=verifyRecovery]').click()
        page.get_by_text('PASS: Probe', exact=False).wait_for()
        page.evaluate("document.querySelector('[data-nav=projects]').click()")
        page.get_by_text('FOLILUNE Genuine Recovery').first.click()
        assert page.locator('#sectionBody').input_value() == 'Chapter one — తెలుగు after restart'
        page.locator('[data-section]').last.click()
        assert page.locator('#sectionBody').input_value() == 'Chapter two survives restart'
        page.evaluate("document.querySelector('[data-nav=settings]').click()")
        page.locator('[data-action=clearRecovery]').click()
        page.get_by_text('Recovery probe removed.', exact=False).wait_for()
    assert not errors, errors
    ctx.close()

def main():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT/'prototypes')))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_address[1]}/studio-stage1-v4.html'
    try:
        with tempfile.TemporaryDirectory() as profile:
            with sync_playwright() as p:
                visit(p, url, profile, True)
                visit(p, url, profile, False)
        print('PASS: Genuine Chromium persisted two chapters + probe across browser restart')
    finally:
        server.shutdown()

if __name__ == '__main__':
    main()
