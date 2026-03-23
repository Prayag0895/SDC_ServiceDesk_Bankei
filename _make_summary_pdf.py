from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parent
src = ROOT / "sumamry.md"
out = ROOT / "sumamry.pdf"

text = src.read_text(encoding="utf-8")
lines = text.splitlines()

styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="H1Custom",
        parent=styles["Heading1"],
        fontSize=18,
        leading=22,
        spaceAfter=8,
        textColor=colors.HexColor("#0f172a"),
    )
)
styles.add(
    ParagraphStyle(
        name="H2Custom",
        parent=styles["Heading2"],
        fontSize=13,
        leading=16,
        spaceAfter=5,
        textColor=colors.HexColor("#111827"),
    )
)
styles.add(
    ParagraphStyle(
        name="BodyCustom",
        parent=styles["BodyText"],
        fontSize=10.5,
        leading=14,
        spaceAfter=3,
    )
)
styles.add(
    ParagraphStyle(
        name="BulletCustom",
        parent=styles["BodyText"],
        fontSize=10.5,
        leading=14,
        leftIndent=12,
        bulletIndent=0,
        spaceAfter=2,
    )
)
styles.add(
    ParagraphStyle(
        name="CodeLike",
        parent=styles["BodyText"],
        fontName="Courier",
        fontSize=9,
        leading=12,
        leftIndent=12,
        textColor=colors.HexColor("#1f2937"),
    )
)

story = []
for raw in lines:
    line = raw.rstrip()

    if not line:
        story.append(Spacer(1, 6))
        continue

    if line.startswith("# "):
        story.append(Paragraph(line[2:].strip(), styles["H1Custom"]))
        continue

    if line.startswith("## "):
        story.append(Spacer(1, 4))
        story.append(Paragraph(line[3:].strip(), styles["H2Custom"]))
        continue

    if line.startswith("---"):
        story.append(Spacer(1, 8))
        story.append(Paragraph("<font color='#6b7280'>----------------------------------------------</font>", styles["BodyCustom"]))
        story.append(Spacer(1, 4))
        continue

    if line.startswith("- "):
        story.append(Paragraph(line[2:].strip(), styles["BulletCustom"], bulletText="•"))
        continue

    if line[:2].isdigit() and line[1] == ".":
        story.append(Paragraph(line, styles["BodyCustom"]))
        continue

    if line.startswith("   - ") or line.startswith("  - "):
        story.append(Paragraph(line.strip()[2:].strip(), styles["BulletCustom"], bulletText="◦"))
        continue

    if "->" in line and not line.endswith(":"):
        story.append(Paragraph(line.replace(" ", "&nbsp;"), styles["CodeLike"]))
        continue

    story.append(Paragraph(line, styles["BodyCustom"]))

doc = SimpleDocTemplate(
    str(out),
    pagesize=A4,
    leftMargin=1.8 * cm,
    rightMargin=1.8 * cm,
    topMargin=1.6 * cm,
    bottomMargin=1.6 * cm,
    title="SDC Service Desk Summary",
    author="GitHub Copilot",
)

doc.build(story)
print(f"Created: {out}")
