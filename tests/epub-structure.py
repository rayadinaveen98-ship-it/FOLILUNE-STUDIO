"""Structural smoke checks for experimental EPUBs. Not formal EPUBCheck conformance."""
from pathlib import Path
from zipfile import ZipFile, ZIP_STORED
from xml.etree import ElementTree as ET

root = Path(__file__).resolve().parent.parent / "test-artifacts"
ns = {"opf": "http://www.idpf.org/2007/opf", "x": "http://www.w3.org/1999/xhtml"}
for name in ("prose.epub", "illustrated.epub"):
    with ZipFile(root / name) as z:
        assert z.testzip() is None
        members = z.namelist()
        assert members[0] == "mimetype"
        assert z.getinfo("mimetype").compress_type == ZIP_STORED
        assert z.read("mimetype") == b"application/epub+zip"
        assert "META-INF/container.xml" in members
        ET.fromstring(z.read("META-INF/container.xml"))
        package = ET.fromstring(z.read("EPUB/package.opf"))
        spine = package.find("opf:spine", ns)
        manifest = package.find("opf:manifest", ns)
        assert len(spine) == 2
        for item in manifest:
            assert "EPUB/" + item.attrib["href"] in members
        nav = ET.fromstring(z.read("EPUB/nav.xhtml"))
        assert len(nav.findall(".//x:li", ns)) == 2
        chapters = [z.read(f"EPUB/text/part-{n:03d}.xhtml") for n in (1, 2)]
        for body in chapters:
            ET.fromstring(body)
        if name == "illustrated.epub":
            assert "చిన్న దీపం".encode() in z.read("EPUB/package.opf")
            assert "చీకటిలో".encode() in b"".join(chapters)
            assert len([p for p in members if p.startswith("EPUB/images/")]) == 2
        else:
            assert b"Mira reached" in chapters[0]
            assert b"A warm light" in chapters[1]
        print("PASS", name, "ZIP/OCF, OPF, nav, XHTML, assets")
