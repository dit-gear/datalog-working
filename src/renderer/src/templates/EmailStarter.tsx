export const EmailStarter = `
import {
  Html,
  Head,
  Heading,
  Preview,
  Body,
  Container,
  Text,
  Section,
} from '@react-email/components';
import { message } from 'data';

const EmailStarter: React.FC = () => {
  return (
    <Html>
      <Head>
        <title>Email Starter</title>
      </Head>
      <Preview>{message?.slice(0, 100)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={title}>Email Starter</Heading>
          <Section>
            <Text style={{ textAlign: 'center' }}>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#ffffff',
  color: '#24292e',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
};

const container = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '20px 0 48px',
};

const title = {
  fontSize: '24px',
  lineHeight: 1.25,
  textAlign: 'center',
};

export default EmailStarter;
`
