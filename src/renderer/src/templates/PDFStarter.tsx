export const PDFStarter = `
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { datalog } from 'data';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    padding: 40,
    fontSize: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

const PDFStarter: React.FC = () => (
  <Document>
    <Page size='A4' style={styles.page}>
      <View>
        <Text style={styles.title}>PDF Starter</Text>
        <Text>ID: {datalog.id}</Text>
      </View>
    </Page>
  </Document>
);

export default PDFStarter;
`
