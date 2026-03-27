import { Site } from '@/app/type/Sign_Register_Sites';
import { SignInRegisterSubmission } from '@/app/type/Sign_Register_Submission';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontSize: 12,
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    height: 40,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    height: 40,
    textAlign: 'center',
    fontSize: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flexGrow: 1,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#F5F5F5',
    padding: 5,
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColFullName: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColOther: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColDateTime: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#616161',
  },
  tableCell: {
    fontSize: 8,
    color: '#000',
  },
});

const LogbookPDF = ({
  data,
  logbookData,
}: {
  data: Site | undefined;
  logbookData: SignInRegisterSubmission[];
}) => {
  const visitorTypeMap: { [key: number]: string } = {
    1: 'Customer',
    2: 'Supplier',
    3: 'Employee',
    4: 'Contractor',
    5: 'Courier / Delivery Person',
    6: 'Family member',
    7: 'Friend',
  };

  return (
    <Document title="Logbook Export">
      <Page size="A4" orientation="landscape" style={styles.page} wrap>
        <Header data={data} />
        <Footer />
        <View style={styles.content}>
          <LogbookTable data={logbookData} visitorTypeMap={visitorTypeMap} />
        </View>
      </Page>
    </Document>
  );
};

export default LogbookPDF;

const LogbookTable = ({
  data,
  visitorTypeMap,
}: {
  data: SignInRegisterSubmission[];
  visitorTypeMap: { [key: number]: string };
}) => {
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: '#0063F7',
          marginVertical: 10,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: 5,
          }}
        >
          Logbook Entries
        </Text>
      </View>

      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={[styles.tableColHeader, styles.tableColFullName]}>
            <Text style={styles.tableCellHeader}>Full Name</Text>
          </View>
          <View style={[styles.tableColHeader, styles.tableColOther]}>
            <Text style={styles.tableCellHeader}>User Type</Text>
          </View>
          <View style={[styles.tableColHeader, styles.tableColOther]}>
            <Text style={styles.tableCellHeader}>Visitor Type</Text>
          </View>
          <View style={[styles.tableColHeader, styles.tableColDateTime]}>
            <Text style={styles.tableCellHeader}>Date & Time</Text>
          </View>
          <View style={[styles.tableColHeader, styles.tableColOther]}>
            <Text style={styles.tableCellHeader}>Status</Text>
          </View>
        </View>

        {/* Table Rows */}
        {data.map((entry, index) => (
          <View key={entry._id || `entry-${index}`} style={styles.tableRow}>
            <View style={[styles.tableCol, styles.tableColFullName]}>
              <Text style={styles.tableCell}>
                {`${entry.firstName || ''} ${entry.lastName || ''}`.trim() || '-'}
              </Text>
            </View>
            <View style={[styles.tableCol, styles.tableColOther]}>
              <Text style={styles.tableCell}>
                {entry.userType == 1 ? 'User' : 'Guest'}
              </Text>
            </View>
            <View style={[styles.tableCol, styles.tableColOther]}>
              <Text style={styles.tableCell}>
                {visitorTypeMap[entry.visitorType] || '-'}
              </Text>
            </View>
            <View style={[styles.tableCol, styles.tableColDateTime]}>
              <Text style={styles.tableCell}>
                {entry.createdAt
                  ? `${dateFormat(entry.createdAt.toString())} ${timeFormat(entry.createdAt.toString())}`
                  : '-'}
              </Text>
            </View>
            <View style={[styles.tableCol, styles.tableColOther]}>
              <Text style={styles.tableCell}>
                {entry.signOutAt == null ? 'Signed in' : 'Signed out'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const Footer = () => {
  return (
    <View style={styles.footer} fixed>
      <View
        style={{
          width: '50%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          textAlign: 'left',
        }}
      >
        <Text style={{ fontSize: 12, color: '#0063F7', fontWeight: 'light' }}>
          Created with{' '}
        </Text>
        <Text style={{ fontSize: 16, color: '#0063F7', fontWeight: 'bold' }}>
          Tiki Workplace
        </Text>
      </View>
      <View
        style={{
          width: '50%',
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        <Text style={{ fontSize: 10, color: 'black', fontWeight: 'normal' }}>
          Copyright Tiki Workplace All Rights Reserved: Page
        </Text>
        <Text
          style={{ fontSize: 10, color: 'black', fontWeight: 'semibold' }}
          render={({ pageNumber }) => ` ${pageNumber} `}
        />
        <Text style={{ fontSize: 10, color: 'black', fontWeight: 'normal' }}>
          of{' '}
        </Text>
        <Text
          style={{ fontSize: 10, color: 'black', fontWeight: 'semibold' }}
          render={({ totalPages }) => ` ${totalPages}`}
        />
      </View>
    </View>
  );
};

const Header = ({ data }: { data: Site | undefined }) => {
  return (
    <View style={styles.header} fixed>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Logbook Export</Text>
      <Text style={{ fontSize: 9, color: '#555' }}>
        Site: {data?.siteName || data?.siteId || '-'}
      </Text>
    </View>
  );
};

