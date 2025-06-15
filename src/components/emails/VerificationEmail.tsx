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

interface VerificationEmailProps {
  email: string
  verificationUrl: string
}

export function VerificationEmail({ 
  email, 
  verificationUrl 
}: VerificationEmailProps) {
  return (
    <Html dir="rtl" lang="he">
      <Head>
        <title>אמת את הרשמתך לעדכוני אל על</title>
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
              marginBottom: '30px'
            }}>
              ברוכים הבאים!
            </Heading>
          </Section>

          <Section>
            <Text style={{ 
              fontSize: '18px', 
              lineHeight: '1.6',
              color: '#333',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              תודה שנרשמת לקבלת עדכוני אל על
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
              marginBottom: '25px'
            }}>
              כדי להשלים את ההרשמה, אנא לחץ על הקישור להלן כדי לאמת את כתובת המייל שלך:
            </Text>
            
            <div style={{ textAlign: 'center' }}>
                              <Button 
                  href={verificationUrl}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '15px 30px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  אמת את המייל שלי
                </Button>
            </div>
          </Section>

          <Section>
            <Text style={{ 
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.5',
              marginBottom: '20px'
            }}>
              <strong>מה תקבל:</strong><br />
              • עדכונים מיידיים על שינויים באתר אל על<br />
              • הודעות על טיסות, לוחות זמנים ושירותים<br />
              • מידע חשוב לנוסעים
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
              marginBottom: '10px'
            }}>
              כתובת המייל: {email}
            </Text>
            <Text style={{ 
              fontSize: '11px',
              color: '#aaa',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              אם לא ביקשת לקבל עדכונים אלה, תוכל להתעלם ממייל זה.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
} 