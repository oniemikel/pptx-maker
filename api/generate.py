"""
Vercel Serverless Function: PPTX Generation Handler
Direct handler without framework overhead (no FastAPI).

Usage: POST /api/generate
Body: {
  "date": "2024-04-10",
  "ds": "Department S content",
  "de": "Department E content",
  "biz": "Business content",
  "cc": "CC content"
}
"""

import json
import io
import base64
from datetime import datetime
from pptx import Presentation


def handler(request):
    """
    PPTX generation handler for Vercel Serverless Functions.
    
    Returns:
        dict: {"statusCode", "headers", "body", "isBase64Encoded"}
    """
    
    # Only accept POST requests
    if request.method != 'POST':
        return {
            'statusCode': 405,
            'body': json.dumps({'error': 'Method not allowed. Use POST.'}),
        }
    
    # Parse JSON body
    try:
        if isinstance(request.body, bytes):
            body = json.loads(request.body.decode('utf-8'))
        else:
            body = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': f'Invalid JSON: {str(e)}'}),
        }
    
    # Extract fields (with defaults)
    date_str = body.get('date', datetime.now().strftime('%Y-%m-%d'))
    ds = body.get('ds', '')
    de = body.get('de', '')
    biz = body.get('biz', '')
    cc = body.get('cc', '')
    
    try:
        # Create PPTX presentation in memory
        prs = Presentation()
        
        # --- Slide 1: Title Slide ---
        slide_layout = prs.slide_layouts[0]
        slide = prs.slides.add_slide(slide_layout)
        title = slide.shapes.title
        subtitle = slide.placeholders[1]
        
        title.text = f"Meeting - {date_str}"
        subtitle.text = "Content Summary"
        
        # --- Slide 2: Content Slide ---
        slide_layout = prs.slide_layouts[1]
        slide = prs.slides.add_slide(slide_layout)
        title = slide.shapes.title
        body_frame = slide.placeholders[1].text_frame
        
        title.text = "Department & Business Content"
        body_frame.text = f"""Department S:
{ds}

Department E:
{de}

Business:
{biz}

CC:
{cc}""".strip()
        
        # Save to in-memory buffer
        pptx_buffer = io.BytesIO()
        prs.save(pptx_buffer)
        pptx_buffer.seek(0)
        
        # Get binary data and encode to base64
        binary_data = pptx_buffer.getvalue()
        binary_b64 = base64.b64encode(binary_data).decode('utf-8')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'Content-Disposition': f'attachment; filename=meeting_{date_str}.pptx',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
            'body': binary_b64,
            'isBase64Encoded': True,
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'PPTX generation failed: {str(e)}'}),
        }
