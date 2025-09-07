from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

"""FastAPI app serving static site + contact form.

Includes basic logging and a safe email-config debug endpoint.
"""

# Load environment variables
load_dotenv()

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO), format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("app")

app = FastAPI()

# Optional CORS for local testing (file:// or different origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your domain(s) in production
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"]
)

# Serve static files (CSS, JS, images)
app.mount("/images", StaticFiles(directory="images"), name="images")

# Serve CSS and JS files from root
@app.get("/style.css")
async def get_css():
    return FileResponse("style.css", media_type="text/css")

@app.get("/script.js")
async def get_js():
    return FileResponse("script.js", media_type="application/javascript")

@app.get("/")
async def read_root():
    """Serve the main HTML page"""
    return FileResponse("index.html")

@app.get("/debug/email-config")
async def debug_email_config():
    """Return non-sensitive email config flags to help debug deployment.

    Does NOT expose secrets. Useful to confirm Render env vars are set.
    """
    try:
        smtp_server = os.getenv('SMTP_SERVER')
        smtp_port = os.getenv('SMTP_PORT')
        email_user = os.getenv('EMAIL_USER')
        recipient_email = os.getenv('RECIPIENT_EMAIL')

        return JSONResponse(
            status_code=200,
            content={
                "smtp_server_set": bool(smtp_server),
                "smtp_port": int(smtp_port) if smtp_port and smtp_port.isdigit() else None,
                "email_user_set": bool(email_user),
                "recipient_email_set": bool(recipient_email),
            },
        )
    except Exception as e:
        logger.exception("/debug/email-config failed")
        raise HTTPException(status_code=500, detail="Debug check failed")

@app.post("/submit-form")
async def submit_contact_form(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(None),
    message: str = Form(None),
    appointment_type: str = Form(...)
):
    """Handle contact form submission"""
    try:
        # Minimal logging (avoid sensitive content)
        logger.info("Form submission: name='%s %s', email='%s', appt_type='%s'", first_name, last_name, email, appointment_type)

        # Send email notification
        send_email(first_name, last_name, email, phone, message, appointment_type)

        return JSONResponse(
            status_code=200,
            content={"status": "success", "message": "Thank you! Your message has been received."}
        )
    
    except Exception as e:
        logger.exception("Form submission failed")
        raise HTTPException(status_code=500, detail="Failed to submit form")

def send_email(first_name, last_name, email, phone, message, appointment_type):
    """Send email with form data using Gmail SMTP"""
    try:
        # Get email settings from environment variables
        smtp_server = os.getenv('SMTP_SERVER')
        smtp_port = int(os.getenv('SMTP_PORT') or 587)
        email_user = os.getenv('EMAIL_USER')
        email_password = os.getenv('EMAIL_PASSWORD')
        recipient_email = os.getenv('RECIPIENT_EMAIL')
        clinic_name = os.getenv('CLINIC_NAME', 'HealthMaster Acupuncture Clinic')

        # Validate config
        missing = []
        if not smtp_server:
            missing.append('SMTP_SERVER')
        if not smtp_port:
            missing.append('SMTP_PORT')
        if not email_user:
            missing.append('EMAIL_USER')
        if not email_password:
            missing.append('EMAIL_PASSWORD')
        if not recipient_email:
            missing.append('RECIPIENT_EMAIL')
        if missing:
            logger.error("Email config missing: %s", ", ".join(missing))
            return
        
        # Format appointment type for display
        appointment_types = {
            'initial_consultation': 'Initial Consultation',
            'follow_up_treatment': 'Follow-up Treatment',
            'inquiry': 'General Inquiry'
        }
        formatted_appointment_type = appointment_types.get(appointment_type, appointment_type)
        
        # Create email message
        msg = MIMEMultipart()
        msg['From'] = email_user
        msg['To'] = recipient_email
        msg['Subject'] = f"{formatted_appointment_type}: {first_name} {last_name}"
        msg['Reply-To'] = email  # So you can reply directly to the client
        
        # Create email body
        phone_text = f"Phone: {phone}" if phone else "Phone: Not provided"
        message_text = message if message else "No message provided"
        
        body = f"""
New contact form submission from HealthMaster Acupuncture website:

Type: {formatted_appointment_type}
Name: {first_name} {last_name}
Email: {email}
{phone_text}

Message:
{message_text}

---
You can reply directly to this email to respond to {first_name}.
Sent from {clinic_name} Website Contact Form
        """
        
        # Attach body to email
        msg.attach(MIMEText(body, 'plain'))
        
        # Connect to SMTP and send email
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_server, smtp_port)
        else:
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()  # Enable encryption (STARTTLS)
        server.login(email_user, email_password)
        text = msg.as_string()
        server.sendmail(email_user, recipient_email, text)
        server.quit()
        logger.info("Email sent successfully to %s via %s:%s", recipient_email, smtp_server, smtp_port)
        
    except Exception as e:
        logger.exception("Email sending failed")
        # Don't raise the exception - we don't want to break the form submission
        # if email fails, the form should still show success to the user

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
