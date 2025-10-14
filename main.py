from fastapi import FastAPI, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import socket
import ssl
import json
import urllib.request
import urllib.error
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
        sendgrid_api_key = os.getenv('SENDGRID_API_KEY')

        return JSONResponse(
            status_code=200,
            content={
                "smtp_server_set": bool(smtp_server),
                "smtp_port": int(smtp_port) if smtp_port and smtp_port.isdigit() else None,
                "email_user_set": bool(email_user),
                "recipient_email_set": bool(recipient_email),
                "sendgrid_set": bool(sendgrid_api_key),
            },
        )
    except Exception as e:
        logger.exception("/debug/email-config failed")
        raise HTTPException(status_code=500, detail="Debug check failed")

@app.post("/submit-form")
async def submit_contact_form(
    background_tasks: BackgroundTasks,
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
        # Send email notification in background to avoid blocking user response
        background_tasks.add_task(send_email, first_name, last_name, email, phone, message, appointment_type)

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
        # Some providers (e.g., Google) display app passwords with spaces for readability.
        # Remove spaces to avoid authentication failures if the value was pasted verbatim.
        if email_password:
            email_password = email_password.replace(" ", "")
        recipient_email = os.getenv('RECIPIENT_EMAIL')
        clinic_name = os.getenv('CLINIC_NAME', 'HealthMaster Acupuncture Clinic')
        # SendGrid fallback configuration
        sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
        sendgrid_from_email = os.getenv('SENDGRID_FROM_EMAIL') or email_user
        sendgrid_from_name = os.getenv('SENDGRID_FROM_NAME') or clinic_name

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
            logger.warning("SMTP config missing: %s", ", ".join(missing))
        
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
        
        # Try SMTP first if configured
        sent = False
        if smtp_server and smtp_port and email_user and email_password and recipient_email:
            timeout = float(os.getenv('SMTP_TIMEOUT', '10'))
            server = None
            try:
                try:
                    if smtp_port == 465:
                        context = ssl.create_default_context()
                        server = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=timeout, context=context)
                        server.ehlo()
                    else:
                        server = smtplib.SMTP(smtp_server, smtp_port, timeout=timeout)
                        server.ehlo()
                        context = ssl.create_default_context()
                        server.starttls(context=context)  # Enable encryption (STARTTLS)
                        server.ehlo()
                    server.login(email_user, email_password)
                    text = msg.as_string()
                    server.sendmail(email_user, recipient_email, text)
                    sent = True
                    logger.info("Email sent successfully to %s via SMTP %s:%s", recipient_email, smtp_server, smtp_port)
                finally:
                    try:
                        if server is not None:
                            server.quit()
                    except Exception:
                        pass
            except Exception:
                logger.exception("SMTP send failed; will try SendGrid if configured")

        # If SMTP was not successful, try SendGrid over HTTPS
        if not sent and sendgrid_api_key and sendgrid_from_email and recipient_email:
            try:
                sg_ok = send_email_via_sendgrid(
                    api_key=sendgrid_api_key,
                    from_email=sendgrid_from_email,
                    from_name=sendgrid_from_name,
                    to_email=recipient_email,
                    subject=msg['Subject'],
                    body=body,
                    reply_to=email,
                )
                if sg_ok:
                    sent = True
                    logger.info("Email sent successfully to %s via SendGrid", recipient_email)
                else:
                    logger.error("SendGrid send returned non-success status")
            except Exception:
                logger.exception("SendGrid send failed")

        if not sent:
            logger.error("All email methods failed; submission stored only in logs")
        
    except Exception as e:
        logger.exception("Email sending failed")
        # Don't raise the exception - we don't want to break the form submission
        # if email fails, the form should still show success to the user


def send_email_via_sendgrid(api_key: str, from_email: str, from_name: str, to_email: str, subject: str, body: str, reply_to: str | None = None) -> bool:
    """Send a plain-text e-mail using SendGrid HTTP API v3 via HTTPS (port 443).

    Uses only the Python standard library (urllib) to avoid extra dependencies.
    Returns True on 2xx, False otherwise.
    """
    url = "https://api.sendgrid.com/v3/mail/send"
    payload = {
        "personalizations": [
            {
                "to": [{"email": to_email}],
            }
        ],
        "from": {"email": from_email, "name": from_name},
        "subject": subject,
        "content": [{"type": "text/plain", "value": body}],
    }
    if reply_to:
        payload["reply_to"] = {"email": reply_to}

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=float(os.getenv('SMTP_TIMEOUT', '10'))) as resp:
            # SendGrid returns 202 Accepted on success
            return 200 <= resp.status < 300
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode("utf-8", errors="ignore")
        except Exception:
            err_body = ""
        logger.error("SendGrid HTTPError %s: %s", getattr(e, 'code', '?'), err_body)
        return False
    except Exception as e:
        logger.error("SendGrid request failed: %s", str(e))
        return False

@app.get("/debug/email-connect")
async def debug_email_connect():
    """Attempt a TCP connect to the configured SMTP host:port with a short timeout.

    This does NOT authenticate or send data; it only checks basic reachability.
    Safe to expose: returns booleans and error text without secrets.
    """
    host = os.getenv('SMTP_SERVER')
    port_str = os.getenv('SMTP_PORT')
    try:
        port = int(port_str) if port_str and port_str.isdigit() else None
    except Exception:
        port = None

    if not host or not port:
        return JSONResponse(status_code=200, content={
            "host_set": bool(host),
            "port": port,
            "reachable": False,
            "error": "SMTP_SERVER/SMTP_PORT not properly configured"
        })

    err = None
    reachable = False
    try:
        with socket.create_connection((host, port), timeout=float(os.getenv('SMTP_TIMEOUT', '5'))):
            reachable = True
    except Exception as ex:
        err = str(ex)

    return JSONResponse(status_code=200, content={
        "host_set": True,
        "port": port,
        "reachable": reachable,
        "error": err
    })

@app.get("/health", include_in_schema=False, response_class=PlainTextResponse)
async def health():
    # No DB, no SMTP, no auth—keep it instant.
    return "OK"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
