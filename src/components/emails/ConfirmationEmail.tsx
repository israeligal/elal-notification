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
        <title>ברוכים הבאים לעדכוני אל על</title>
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
              color: '#003d82', 
              fontSize: '28px',
              textAlign: 'center',
              marginBottom: '10px'
            }}>
              ✈️ ברוכים הבאים!
            </Heading>
            <Heading style={{ 
              color: '#666', 
              fontSize: '20px',
              textAlign: 'center',
              fontWeight: 'normal',
              marginBottom: '30px'
            }}>
              Welcome to El Al Updates!
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
              🎉 נרשמת בהצלחה לקבלת עדכוני אל על!
            </Text>
            <Text style={{ 
              fontSize: '16px', 
              lineHeight: '1.5',
              color: '#666',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              You&apos;ve successfully subscribed to El Al updates!
            </Text>
          </Section>

          <Section style={{
            backgroundColor: '#f8f9fa',
            padding: '25px',
            borderRadius: '6px',
            border: '1px solid #e9ecef',
            marginBottom: '30px'
          }}>
            <Text style={{ 
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#333',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              ✅ אתה כבר מוכן לקבל עדכונים!
            </Text>
            <Text style={{ 
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#666',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              You&apos;re all set to receive updates!
            </Text>
            
            <Text style={{ 
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.5',
              marginBottom: '0',
              textAlign: 'center'
            }}>
              נבדוק עדכונים כל 10 דקות ונשלח לך הודעה מיד כשיש משהו חדש<br />
              <em>We check for updates every 10 minutes and will notify you immediately</em>
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
              • מידע חשוב לנוסעים
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
              • Important information for passengers
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
              כתובת המייל שלך: {email}
            </Text>
            
            <Text style={{ 
              fontSize: '12px',
              color: '#666',
              textAlign: 'center',
              marginBottom: '15px'
            }}>
              לא מעוניין יותר? | Don&apos;t want to receive updates anymore?
            </Text>
            
            <div style={{ textAlign: 'center' }}>
              <Button 
                href={unsubscribeUrl}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '12px'
                }}
              >
                ביטול הרשמה | Unsubscribe
              </Button>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  )
} 