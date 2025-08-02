from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

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

@app.post("/submit-form")
async def submit_contact_form(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(None),
    message: str = Form(None)
):
    """Handle contact form submission"""
    try:
        # Print the form data for debugging
        print("=== FORM SUBMISSION ===")
        print(f"Name: {first_name} {last_name}")
        print(f"Email: {email}")
        print(f"Phone: {phone}")
        print(f"Message: {message}")
        print("=====================")
        
        # Send email notification
        send_email(first_name, last_name, email, phone, message)
        
        return JSONResponse(
            status_code=200,
            content={"status": "success", "message": "Thank you! Your message has been received."}
        )
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit form")

def send_email(first_name, last_name, email, phone, message):
    """Send email with form data using Gmail SMTP"""
    try:
        # Get email settings from environment variables
        smtp_server = os.getenv('SMTP_SERVER')
        smtp_port = int(os.getenv('SMTP_PORT'))
        email_user = os.getenv('EMAIL_USER')
        email_password = os.getenv('EMAIL_PASSWORD')
        recipient_email = os.getenv('RECIPIENT_EMAIL')
        clinic_name = os.getenv('CLINIC_NAME', 'HealthMaster Acupuncture Clinic')
        
        # Create email message
        msg = MIMEMultipart()
        msg['From'] = email_user
        msg['To'] = recipient_email
        msg['Subject'] = f"New Contact Form Submission - {first_name} {last_name}"
        msg['Reply-To'] = email  # So you can reply directly to the client
        
        # Create email body
        phone_text = f"Phone: {phone}" if phone else "Phone: Not provided"
        message_text = message if message else "No message provided"
        
        body = f"""
New contact form submission from HealthMaster Acupuncture website:

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
        
        # Connect to Gmail SMTP server and send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Enable encryption
        server.login(email_user, email_password)
        text = msg.as_string()
        server.sendmail(email_user, recipient_email, text)
        server.quit()
        
        print(f"✅ Email sent successfully to {recipient_email}")
        
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        # Don't raise the exception - we don't want to break the form submission
        # if email fails, the form should still show success to the user

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
