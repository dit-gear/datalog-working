import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { projectName, datalogs, total } from 'data';
import logo from './assets/obsidian.png';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', padding: 40, fontSize: 12, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  projectInfo: { fontSize: 12 },
  table: { display: 'table', width: '100%', borderCollapse: 'collapse', marginTop: 10 },
  row: { flexDirection: 'row' },
  headerCell: {
    flex: 1,
    padding: 6,
    backgroundColor: '#000',
    color: '#fff',
    fontSize: 6,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  cell: {
    flex: 1,
    padding: 6,
    fontSize: 4,
    color: '#333',
    textAlign: 'left',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  zebra: { backgroundColor: '#f8f8f8' },
  pageNumber: { fontSize: 4, position: 'absolute', bottom: 20, right: 20 },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  header: {
    flex: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    width: '25%',
    gap: 2,
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dedede',
  },
  cardTitle: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 14,
    fontWeight: '200',
  },
});

const DataReport: React.FC = () => {
  const rows = datalogs.map((log) => ({
    index: log.id,
    day: log.day,
    date: new Date(log.date).toLocaleDateString(), // Use toLocaleDateString() to format ISO date to any locale.
    duration: log.ocf.duration(),
    ocf_size: log.ocf.size(),
    proxy_size: log.proxy.size(),
    audio_size: log.sound.size(),
    reels: log.ocf.reels({ rangeMerging: true }),
    copies: log.ocf
      .copies()
      .map(
        (vol, index) =>
          `${vol.count[0] === vol.count[1] ? '[OK] ' : '[NOT COMPLETE]'}Copy ${index + 1}: ${vol.volumes}\n`,
      ),
  }));
  const headers = Object.keys(rows[0] || {});

  const shootingDays = () => {
    const [start, end] = total.dateRange();
    return start === end ? start : `${start} - ${end}`;
  };

  return (
    <Document title='Clips'>
      <Page size='A4' orientation='landscape' style={styles.page}>
        <View>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Data Report</Text>
              <Text style={styles.projectInfo}>Project: {projectName}</Text>
              <Text style={styles.projectInfo}>Shooting Dates: {shootingDays()}</Text>
            </View>
            <Image style={styles.logo} src={logo} />
          </View>
          <View style={styles.cardGroup}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Total Duration</Text>
              <Text style={styles.cardText}>{total.ocf.duration()}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Total OCF Size</Text>
              <Text style={styles.cardText}>{total.ocf.size()}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Total Proxy Size</Text>
              <Text style={styles.cardText}>{total.proxy.size()}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Total Sound Size</Text>
              <Text style={styles.cardText}>{total.sound.size()}</Text>
            </View>
          </View>
          <View style={styles.table}>
            {/* Header Row */}
            <View style={styles.row} fixed>
              {headers.map((header, i) => (
                <Text
                  key={i}
                  style={[
                    styles.headerCell,
                    i === 0 && { borderTopLeftRadius: 4 },
                    i === headers.length - 1 && { borderTopRightRadius: 4 },
                  ]}
                >
                  {header.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </Text>
              ))}
            </View>

            {/* Data Rows */}
            {rows.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={[styles.row, rowIndex % 2 === 1 ? styles.zebra : {}]}
                wrap={false}
              >
                {headers.map((header, colIndex) => (
                  <Text key={colIndex} style={styles.cell}>
                    {row[header]}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => totalPages > 1 && `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

export default DataReport;
