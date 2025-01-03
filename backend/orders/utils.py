#!/usr/bin/env python3
"""utils module"""

import resend
from decouple import config

def send_mail(email, subject, content):
  resend.api_key = config('RESEND_API_KEY')

  r = resend.Emails.send({
    "from": "support@primeeats.live",
    "to": email,
    "subject": subject,
    "html": content
  })
