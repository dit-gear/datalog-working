import { Html, Head, Preview, Body, Container, Text, Font, Section } from '@react-email/components';
import { projectName, datalog, message } from 'data';

const DaySummary: React.FC = () => {
  return (
    <Html>
      <Head></Head>
      <Preview>{`Datalog - ${projectName} - DAY ${datalog.day} - ${datalog.date}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={title}>
              {projectName} - DAY {datalog.day} - {datalog.date}
            </Text>
          </Section>
          <Section style={section}>
            <Text>
              All footage has been successfully collected, backed up to{' '}
              <strong>{datalog.ocf.copies().length}</strong> seperate locations, and is in good
              standing.
            </Text>
            <table style={table}>
              {datalog.ocf.copies().map((copy, index) => (
                <tr key={index}>
                  <th>✅ Verified Copy {index + 1}:</th>
                  <td>{copy.volumes}</td>
                </tr>
              ))}
            </table>
          </Section>
          <Section style={card}>
            <Text style={cardTitle}>Duration:</Text>
            <Text style={cardText}>{datalog.ocf.duration()}</Text>
          </Section>
          <Section style={card}>
            <Text style={cardTitle}>Camera Reels:</Text>
            <Text style={cardText}>{datalog.ocf.reels({ rangeMerging: true })}</Text>
          </Section>
          <Section style={card}>
            <Text style={cardTitle}>Camera Files:</Text>
            <Text style={cardText}>
              {datalog.ocf.files()} clips, {datalog.ocf.size()}
            </Text>
          </Section>
          {datalog.sound.files() > 0 && (
            <Section style={card}>
              <Text style={cardTitle}>Sound Files:</Text>
              <Text style={cardText}>
                {datalog.sound.files()} clips, {datalog.sound.size()}
              </Text>
            </Section>
          )}
          <Section>
            <Text style={{ textAlign: 'center' }}>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const table = {
  textAlign: 'left',
  marginLeft: 'auto',
  marginRight: 'auto',
  borderTop: '1px solid black',
  paddingTop: '10px',
};

const card = {
  padding: '0 18px',
  margin: '8px 0',
  borderRadius: '15px',
  border: 'solid 1px #dedede',
};
const cardTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
};
const cardText = {
  fontSize: '28px',
  fontWeight: '200',
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

const section = {
  padding: '24px',
  border: 'solid 1px #dedede',
  borderRadius: '10px',
  textAlign: 'center',
};

export default DaySummary;
