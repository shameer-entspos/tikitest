import { Orderitinreray } from '@/app/type/order_itinreray';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
  tableColName: {
    width: '30%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColAssetId: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColStatus: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColCondition: {
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

const OrderItineraryPDF = ({ data }: { data: Orderitinreray | undefined }) => {
  return (
    <Document title="Asset Order Report">
      <Page size="A4" orientation="portrait" style={styles.page} wrap>
        <Header data={data} />
        <Footer />
        <View style={styles.content}>
          <OverviewPage data={data} />
          {(data?.assets ?? []).length > 0 && <AssetsPage data={data} />}
        </View>
      </Page>
    </Document>
  );
};

export { OrderItineraryPDF };

const Header = ({ data }: { data: Orderitinreray | undefined }) => {
  return (
    <View style={styles.header} fixed>
      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0063F7' }}>
        Asset Order Report
      </Text>
      <Text style={{ fontSize: 9, color: '#616161' }}>
        Last Modified: {data ? dateFormat(data.updatedAt.toString()) : ''}{' '}
        {data ? timeFormat(data.updatedAt.toString()) : ''}
      </Text>
    </View>
  );
};

const Footer = () => {
  return (
    <View style={styles.footer} fixed>
      <Text style={{ fontSize: 9, color: '#616161' }}>
        Created with Tiki Workplace
      </Text>
      <Text
        style={{ fontSize: 9, color: '#616161' }}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
};

const OverviewPage = ({ data }: { data: Orderitinreray | undefined }) => {
  if (!data) return null;

  return (
    <View style={{ flexDirection: 'column' }}>
      {/* Order Details Section */}
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
            padding: 10,
          }}
        >
          Order Details
        </Text>
      </View>

      {/* Order Information */}
      <View style={{ marginTop: 10 }}>
        <HeadingWithValueColumn
          heading="Order Number"
          value={data.orderNumber || '-'}
        />
        <HeadingWithValueColumn
          heading="Status"
          value={data.status === 'in' ? 'Checked In' : 'Checked Out'}
        />
        <HeadingWithValueColumn
          heading="Condition"
          value={data.condition || '-'}
        />
        <HeadingWithValueColumn
          heading="Ordered By"
          value={
            data.createdBy
              ? `${data.createdBy.firstName || ''} ${data.createdBy.lastName || ''}`.trim() ||
                '-'
              : '-'
          }
        />
        <HeadingWithValueColumn
          heading="Assigned Projects"
          value={
            (data.checkedOutProject ?? []).length > 0
              ? data.checkedOutProject.map((p) => p.name).join(', ')
              : 'Not Assigned'
          }
        />
        <HeadingWithValueColumn
          heading="Created Date"
          value={dateFormat(data.createdAt.toString())}
        />
        <HeadingWithValueColumn
          heading="Created Time"
          value={timeFormat(data.createdAt.toString())}
        />
        <HeadingWithValueColumn
          heading="Updated Date"
          value={dateFormat(data.updatedAt.toString())}
        />
        <HeadingWithValueColumn
          heading="Updated Time"
          value={timeFormat(data.updatedAt.toString())}
        />
      </View>
    </View>
  );
};

const AssetsPage = ({ data }: { data: Orderitinreray | undefined }) => {
  if (!data || (data.assets ?? []).length === 0) return null;

  return (
    <View style={{ marginTop: 20 }}>
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
            padding: 10,
          }}
        >
          Assets ({data.assets.length})
        </Text>
      </View>

      {/* Assets Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, { backgroundColor: '#F5F5F5' }]}>
          <View style={styles.tableColName}>
            <Text style={styles.tableCellHeader}>Asset Name</Text>
          </View>
          <View style={styles.tableColAssetId}>
            <Text style={styles.tableCellHeader}>Asset ID</Text>
          </View>
          <View style={styles.tableColStatus}>
            <Text style={styles.tableCellHeader}>Status</Text>
          </View>
          <View style={styles.tableColCondition}>
            <Text style={styles.tableCellHeader}>Condition</Text>
          </View>
        </View>

        {/* Table Rows */}
        {data.assets.map((asset, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableColName}>
              <Text style={styles.tableCell}>{asset.name || '-'}</Text>
            </View>
            <View style={styles.tableColAssetId}>
              <Text style={styles.tableCell}>{asset.atnNum || '-'}</Text>
            </View>
            <View style={styles.tableColStatus}>
              <Text style={styles.tableCell}>
                {asset.status || asset.isCheckedOut
                  ? 'Checked Out'
                  : 'Available'}
              </Text>
            </View>
            <View style={styles.tableColCondition}>
              <Text style={styles.tableCell}>
                {asset.checkInCondition || '-'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const HeadingWithValueColumn = ({
  heading,
  value,
}: {
  heading: string;
  value: string;
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 5,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
      }}
    >
      <View style={{ width: '40%' }}>
        <Text style={{ fontSize: 9, color: '#555' }}>{heading}</Text>
      </View>
      <View style={{ width: '60%' }}>
        <Text style={{ fontSize: 10, color: '#000', fontWeight: 'medium' }}>
          {value || '-'}
        </Text>
      </View>
    </View>
  );
};
