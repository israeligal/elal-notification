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
import type { ScrapedContent } from '@/types/notification.type'

interface UpdateNotificationEmailProps {
  updates: ScrapedContent[]
  unsubscribeUrl: string
  timestamp: Date
}

export function UpdateNotificationEmail({ 
  updates, 
  unsubscribeUrl, 
  timestamp 
}: UpdateNotificationEmailProps) {
  return (
    <Html dir="rtl" lang="he">
      <Head>
        <title>עדכונים חדשים מאל על</title>
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
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px',
          marginBottom: '20px'
        }}>
          <Section>
            <Heading style={{ 
              color: '#003d82', 
              fontSize: '24px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              עדכונים חדשים מאל על
            </Heading>
          </Section>

          <Section>
            <Text style={{ 
              fontSize: '16px', 
              lineHeight: '1.6',
              color: '#333',
              marginBottom: '30px'
            }}>
              שלום רב, נמצאו עדכונים חדשים באתר אל על:
            </Text>
          </Section>

          {updates.map((update, index) => (
            <Section key={index} style={{ 
              marginBottom: '30px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <Heading style={{ 
                fontSize: '18px',
                color: '#003d82',
                marginBottom: '12px',
                lineHeight: '1.4'
              }}>
                {update.title}
              </Heading>
              
              <Text style={{ 
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#555',
                marginBottom: '12px',
                whiteSpace: 'pre-wrap'
              }}>
                {update.content}
              </Text>

              {update.publishDate && (
                <Text style={{ 
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '8px'
                }}>
                  תאריך: {update.publishDate}
                </Text>
              )}

              {update.url && (
                <Button 
                  href={update.url}
                  style={{
                    backgroundColor: '#003d82',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  קרא עוד
                </Button>
              )}
            </Section>
          ))}

          <Hr style={{ 
            border: 'none', 
            borderTop: '1px solid #e9ecef',
            margin: '30px 0'
          }} />

          <Section>
            <Text style={{ 
              fontSize: '12px',
              color: '#888',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              עדכון נשלח בתאריך: {timestamp.toLocaleDateString('he-IL')} {timestamp.toLocaleTimeString('he-IL')}
            </Text>
            
            <Text style={{ 
              fontSize: '12px',
              color: '#666',
              textAlign: 'center',
              marginBottom: '15px'
            }}>
              לא מעוניין לקבל עדכונים?
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
                  ביטול הרשמה
                </Button>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  )
} 