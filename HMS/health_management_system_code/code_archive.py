from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import os

def add_code_file(c, filepath, start_y, max_width, max_height):
    c.setFont("Courier", 7)
    y = start_y
    left_margin = inch * 0.5
    right_margin = left_margin + max_width
    line_height = 9
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except UnicodeDecodeError:
        # Skip binary files or non-text
        return y
    c.drawString(left_margin, y, f"File: {filepath}")
    y -= line_height * 2
    for line in lines:
        # Wrap long lines
        while len(line) > 100:
            part = line[:100]
            c.drawString(left_margin, y, part.rstrip())
            y -= line_height
            line = line[100:]
            if y < inch:
                c.showPage()
                y = max_height
                c.setFont("Courier", 7)
        c.drawString(left_margin, y, line.rstrip())
        y -= line_height
        if y < inch:
            c.showPage()
            y = max_height
            c.setFont("Courier", 7)
    return y

def generate_code_pdf(root_dir, output_pdf):
    c = canvas.Canvas(output_pdf, pagesize=letter)
    width, height = letter
    y = height - inch
    max_width = width - inch
    max_height = height - inch
    for subdir, _, files in os.walk(root_dir):
        for file in sorted(files):
            filepath = os.path.join(subdir, file)
            y = add_code_file(c, filepath, y, max_width, max_height)
            if y < inch:
                c.showPage()
                y = height - inch
    c.save()

if __name__ == "__main__":
    root_dir = "."
    output_pdf = "health_management_system_code.pdf"
    generate_code_pdf(root_dir, output_pdf)
    print(f"Code archive PDF generated: {output_pdf}")
