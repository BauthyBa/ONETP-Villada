from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.api import deps
from app.services.email import email_service

router = APIRouter()

@router.post("/test-email")
def test_email(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.get_current_admin),
) -> dict:
    """
    Test email functionality by sending a test email to the current user
    """
    try:
        subject = "Test Email - ONIET"
        html_content = """
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">Test Email</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px;">ONIET - Email System Test</p>
                </div>
                
                <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
                    <h2 style="color: #667eea; margin-top: 0;">Hello!</h2>
                    
                    <p>This is a test email to verify that the email system is working correctly.</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p>If you're receiving this email, it means that:</p>
                        <ul>
                            <li>The email service is properly configured</li>
                            <li>SMTP connection is working</li>
                            <li>HTML emails are being rendered correctly</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 14px;">
                            <strong>ONIET - Olimpíada Nacional de ETP 2025</strong>
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        success = email_service.send_email(
            to_email=current_user.email,
            subject=subject,
            html_content=html_content
        )
        
        if success:
            return {"message": "Test email sent successfully"}
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to send test email"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error sending test email: {str(e)}"
        ) 