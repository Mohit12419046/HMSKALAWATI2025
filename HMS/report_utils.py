# backend/report_utils.py
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io
from datetime import datetime
def generate_health_report(user, vitals, symptoms, meds, appts):
    """
    Returns bytes of a simple PDF summarizing the supplied records.
    """
    mem = io.BytesIO()
    c = canvas.Canvas(mem, pagesize=letter)
    width, height = letter
    y = height - 50
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, f"Health Report — {user.get('name','User')}")
    y -= 25
    c.setFont("Helvetica", 10)
    c.drawString(50, y, f"Generated: {datetime.now().isoformat(sep=' ', timespec='seconds')}")
    y -= 30
    def draw_section(title, rows, formatter):
        nonlocal y
        c.setFont("Helvetica-Bold", 12); c.drawString(50, y, title); y -= 14
        c.setFont("Helvetica", 9)
        if not rows:
            c.drawString(60, y, "— none"); y -= 16
            return
        for r in rows:
            for line in formatter(r):
                if y < 80:
                    c.showPage(); y = height - 50
                c.drawString(60, y, line)
                y -= 12
            y -= 6
    draw_section("Vitals", vitals, lambda v: [f"{v['timestamp']} — {v['type']}: {v['value']} {v['unit']}"])
    draw_section("Symptoms", symptoms, lambda s: [f"{s['timestamp']} — {s['name']} ({s['system']}) severity={s['severity']}", f"Notes: {s['notes'] or '—'}"])
    draw_section("Medications", meds, lambda m: [f"{m['name']} {m['dose']} — {m['schedule']} (start {m['start_date'] or '—'})"])
    draw_section("Appointments", appts, lambda a: [f"{a['datetime']} — Dr. {a['doctor']} ({a['type']})"])
    c.showPage()
    c.save()
    mem.seek(0)
    return mem.read()
