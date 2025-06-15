import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from '@react-email/components'

interface ConfirmationEmailProps {
  email: string
  unsubscribeUrl: string
}

export function ConfirmationEmail({ 
  email, 
  unsubscribeUrl 
}: ConfirmationEmailProps) {
  return (
    <Html dir="rtl" lang="he">
      <Head>
        <title>הרשמה הושלמה בהצלחה | Registration Complete</title>
      </Head>
      <Body style={{ 
        fontFamily: 'Arial, sans-serif', 
        backgroundColor: '#f6f9fc',
        direction: 'rtl',
        textAlign: 'right'
      }}>
        <Container style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          marginTop: '20px',
          marginBottom: '20px'
        }}>
          <Section>
            <Heading style={{ 
              color: '#28a745', 
              fontSize: '28px',
              textAlign: 'center',
              marginBottom: '10px'
            }}>
              !הרשמה הושלמה בהצלחה
            </Heading>
            <Heading style={{ 
              color: '#666', 
              fontSize: '20px',
              textAlign: 'center',
              fontWeight: 'normal',
              marginBottom: '30px'
            }}>
              Registration Complete!
            </Heading>
          </Section>

          <Section>
            <Text style={{ 
              fontSize: '18px', 
              lineHeight: '1.6',
              color: '#333',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              תודה שאימתת את כתובת המייל שלך.
            </Text>
            <Text style={{ 
              fontSize: '16px', 
              lineHeight: '1.5',
              color: '#666',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              Thank you for verifying your email address.
            </Text>
          </Section>

          <Section style={{
            backgroundColor: '#e8f5e8',
            padding: '25px',
            borderRadius: '6px',
            border: '1px solid #d4edda',
            marginBottom: '30px'
          }}>
            <Text style={{ 
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#155724',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              עכשיו תקבל עדכונים על חדשות אל על ישירות למייל.
            </Text>
            <Text style={{ 
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#155724',
              marginBottom: '25px',
              textAlign: 'center'
            }}>
              You will now receive El Al updates directly to your inbox.
            </Text>
          </Section>

          <Section>
            <Text style={{ 
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.5',
              marginBottom: '15px'
            }}>
              <strong>מה תקבל:</strong><br />
              • עדכונים מיידיים על שינויים באתר אל על<br />
              • הודעות על טיסות, לוחות זמנים ושירותים<br />
              • מידע חשוב לנוסעים<br />
              • בדיקות כל 10 דקות - רק עדכונים חשובים
            </Text>
            <Text style={{ 
              fontSize: '13px',
              color: '#888',
              lineHeight: '1.4',
              marginBottom: '20px'
            }}>
              <strong>What you&apos;ll receive:</strong><br />
              • Immediate updates about changes on the El Al website<br />
              • Notifications about flights, schedules, and services<br />
              • Important information for passengers<br />
              • Monitoring every 10 minutes - only important updates
            </Text>
          </Section>

          <Hr style={{ 
            border: 'none', 
            borderTop: '1px solid #e9ecef',
            margin: '25px 0'
          }} />

          <Section>
            <Text style={{ 
              fontSize: '12px',
              color: '#888',
              textAlign: 'center',
              marginBottom: '15px'
            }}>
              כתובת המייל: {email}
            </Text>
            <Text style={{ 
              fontSize: '11px',
              color: '#aaa',
              textAlign: 'center',
              lineHeight: '1.4',
              marginBottom: '20px'
            }}>
              רוצה לבטל את המנוי? תוכל לעשות זאת בכל עת דרך הקישור שיופיע בתחתית כל מייל<br />
              Want to unsubscribe? You can do so anytime via the link at the bottom of each email
            </Text>
            
            <div style={{ textAlign: 'center' }}>
              <Button 
                href={unsubscribeUrl}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 'normal'
                }}
              >
                בטל מנוי | Unsubscribe
              </Button>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  )
} 