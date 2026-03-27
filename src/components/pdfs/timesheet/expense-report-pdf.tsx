import { JSAAppModel } from '@/app/(main)/(user-panel)/user/apps/api';
import {
  calculateTotalTime,
  dateFormat,
  formatTimeTwoChar,
  timeFormat,
} from '@/app/helpers/dateFormat';
import { Expanse } from '@/app/type/expanse';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 60, // Reserve space for header
    paddingBottom: 60, // Reserve space for footer
    paddingHorizontal: 40,
    fontSize: 12,
  },
  image: {
    width: 100,
    height: 100,
    objectFit: 'cover', // Optional: cover, contain, fill
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
  ///// nnew conntnt

  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
    color: '#616161',
    fontWeight: 'semibold',
    padding: 9,
  },
  tableCell: {
    padding: 9,
  },
  evenRow: {
    backgroundColor: '#F5F5F5',
  },
});
const ExpanseReportPDF = ({ data }: { data: Expanse[] | undefined }) => {
  return (
    <Document title="Expense Report">
      <Page size="A4" orientation="landscape" style={styles.page} wrap>
        {/* Header */}

        <Header />

        {/* Footer */}
        <Footer />

        {/* Main Content */}

        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View
              style={[
                styles.tableHeader,
                { width: '20%', flexDirection: 'row' },
              ]}
            >
              <Text>Timesheet ID</Text>
              <Svg
                width={12}
                height={12}
                viewBox="0 0 18 18"
                style={{ marginLeft: 4 }}
              >
                <Path
                  d="M12.9373 3L12.8623 3.00525C12.7274 3.0234 12.6036 3.08988 12.5139 3.19236C12.4243 3.29483 12.3749 3.42635 12.3748 3.5625V13.0815L9.9598 10.668L9.8968 10.614C9.78265 10.5292 9.64059 10.4907 9.49922 10.5064C9.35786 10.5221 9.22768 10.5907 9.1349 10.6985C9.04212 10.8063 8.99362 10.9453 8.99917 11.0874C9.00471 11.2295 9.0639 11.3643 9.1648 11.4645L12.5428 14.8395L12.6058 14.8935C12.7142 14.9735 12.8476 15.012 12.982 15.002C13.1163 14.9919 13.2426 14.934 13.3378 14.8387L16.7106 11.4637L16.7646 11.4008C16.8448 11.2923 16.8834 11.1587 16.8734 11.0242C16.8633 10.8897 16.8053 10.7633 16.7098 10.668L16.6468 10.614C16.5384 10.5338 16.4048 10.4951 16.2703 10.5052C16.1357 10.5152 16.0093 10.5733 15.9141 10.6688L13.4998 13.0845V3.5625L13.4953 3.486C13.4768 3.35133 13.4102 3.22792 13.3077 3.13858C13.2053 3.04923 13.0732 3.00001 12.9373 3ZM4.66105 3.165L1.2898 6.53625L1.23505 6.59925C1.15501 6.7076 1.11652 6.84108 1.12657 6.97541C1.13661 7.10974 1.19454 7.23601 1.2898 7.33125L1.3528 7.386C1.46115 7.46603 1.59463 7.50453 1.72896 7.49448C1.86329 7.48443 1.98956 7.42651 2.0848 7.33125L4.49755 4.91775V14.4412L4.50355 14.5177C4.52204 14.6524 4.58866 14.7758 4.6911 14.8652C4.79354 14.9545 4.92487 15.0037 5.0608 15.0037L5.13655 14.9985C5.27135 14.9802 5.39495 14.9136 5.48444 14.8112C5.57394 14.7087 5.62327 14.5773 5.6233 14.4412L5.62255 4.91925L8.0398 7.332L8.1028 7.386C8.21703 7.46979 8.35867 7.50739 8.49942 7.49128C8.64016 7.47518 8.76965 7.40657 8.86201 7.29915C8.95437 7.19173 9.00279 7.05342 8.99761 6.91185C8.99243 6.77028 8.93402 6.63588 8.83405 6.5355L5.45605 3.165L5.3923 3.111C5.28395 3.03096 5.15047 2.99247 5.01614 3.00252C4.88181 3.01257 4.75554 3.07049 4.6603 3.16575"
                  fill="#0063F7"
                />
              </Svg>
            </View>
            <View style={[styles.tableHeader, { width: '25%' }]}>
              <Text>Assigned Project</Text>
            </View>
            <View style={[styles.tableHeader, { width: '10%' }]}>
              <Text>Cost</Text>
            </View>
            <View style={[styles.tableHeader, { width: '25%' }]}>
              <Text>Submitted By</Text>
            </View>
            <View
              style={[
                styles.tableHeader,
                { width: '20%', flexDirection: 'row' },
              ]}
            >
              <Text>Date</Text>
              <Svg
                width={12}
                height={12}
                viewBox="0 0 18 18"
                style={{ marginLeft: 4 }}
              >
                <Path
                  d="M12.9373 3L12.8623 3.00525C12.7274 3.0234 12.6036 3.08988 12.5139 3.19236C12.4243 3.29483 12.3749 3.42635 12.3748 3.5625V13.0815L9.9598 10.668L9.8968 10.614C9.78265 10.5292 9.64059 10.4907 9.49922 10.5064C9.35786 10.5221 9.22768 10.5907 9.1349 10.6985C9.04212 10.8063 8.99362 10.9453 8.99917 11.0874C9.00471 11.2295 9.0639 11.3643 9.1648 11.4645L12.5428 14.8395L12.6058 14.8935C12.7142 14.9735 12.8476 15.012 12.982 15.002C13.1163 14.9919 13.2426 14.934 13.3378 14.8387L16.7106 11.4637L16.7646 11.4008C16.8448 11.2923 16.8834 11.1587 16.8734 11.0242C16.8633 10.8897 16.8053 10.7633 16.7098 10.668L16.6468 10.614C16.5384 10.5338 16.4048 10.4951 16.2703 10.5052C16.1357 10.5152 16.0093 10.5733 15.9141 10.6688L13.4998 13.0845V3.5625L13.4953 3.486C13.4768 3.35133 13.4102 3.22792 13.3077 3.13858C13.2053 3.04923 13.0732 3.00001 12.9373 3ZM4.66105 3.165L1.2898 6.53625L1.23505 6.59925C1.15501 6.7076 1.11652 6.84108 1.12657 6.97541C1.13661 7.10974 1.19454 7.23601 1.2898 7.33125L1.3528 7.386C1.46115 7.46603 1.59463 7.50453 1.72896 7.49448C1.86329 7.48443 1.98956 7.42651 2.0848 7.33125L4.49755 4.91775V14.4412L4.50355 14.5177C4.52204 14.6524 4.58866 14.7758 4.6911 14.8652C4.79354 14.9545 4.92487 15.0037 5.0608 15.0037L5.13655 14.9985C5.27135 14.9802 5.39495 14.9136 5.48444 14.8112C5.57394 14.7087 5.62327 14.5773 5.6233 14.4412L5.62255 4.91925L8.0398 7.332L8.1028 7.386C8.21703 7.46979 8.35867 7.50739 8.49942 7.49128C8.64016 7.47518 8.76965 7.40657 8.86201 7.29915C8.95437 7.19173 9.00279 7.05342 8.99761 6.91185C8.99243 6.77028 8.93402 6.63588 8.83405 6.5355L5.45605 3.165L5.3923 3.111C5.28395 3.03096 5.15047 2.99247 5.01614 3.00252C4.88181 3.01257 4.75554 3.07049 4.6603 3.16575"
                  fill="#0063F7"
                />
              </Svg>
            </View>
          </View>

          {/* Table Body */}
          {(data ?? []).map((item, index) => (
            <View
              style={[styles.tableRow, index % 2 === 1 ? styles.evenRow : {}]}
              key={item._id}
            >
              <View style={[styles.tableCell, { width: '20%' }]}>
                <Text>{item.referenceId}</Text>
              </View>
              <View style={[styles.tableCell, { width: '25%' }]}>
                <View
                  style={{
                    backgroundColor: '#97F1BB',
                    paddingHorizontal: 6, // Increased horizontal padding
                    paddingVertical: 2, // Small vertical padding
                    borderRadius: 4, // Subtle rounded corners
                    alignSelf: 'flex-start', // Prevents full width
                    flexDirection: 'row', // Ensures proper text alignment
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      color: '#555',
                      textAlign: 'center', // Centers text within the background
                    }}
                  >
                    {(item.projects ?? []).length == 1
                      ? item.projects[0].name
                      : (item.projects ?? []).length > 1
                        ? `${item.projects[0].name} +${item.projects.length - 1}`
                        : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={[styles.tableCell, { width: '10%' }]}>
                <Text>{item.invoiceValue}</Text>
              </View>
              <View
                style={[
                  styles.tableCell,
                  { width: '25%', flexDirection: 'row' },
                ]}
              >
                <Text>
                  {`${item.createdBy?.firstName} ${item.createdBy?.lastName}` ||
                    'N/A'}
                </Text>
              </View>
              <View style={[styles.tableCell, { width: '20%' }]}>
                <Text>{dateFormat(item.createdAt.toString())}</Text>
              </View>
            </View>
          ))}
          <Text
            style={{
              fontSize: 16,
              color: '#000',
              fontWeight: 'bold',
              paddingLeft: 10,
              paddingTop: 10,
            }}
          >
            Total Cost:
            {` ${(data ?? []).reduce(
              (sum, app) => sum + (Number(app.invoiceValue) || 0),
              0
            )}.00`}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ExpanseReportPDF;

const Page1 = ({ data }: { data: Expanse[] | undefined }) => {
  return (
    <View style={{ flexDirection: 'column' }}>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between' }}
      ></View>
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
        flexDirection: 'column',
        justifyContent: 'center',
        paddingVertical: 5,
      }}
    >
      <Text style={{ fontSize: 9, color: '#555' }}>{heading}</Text>
      <Text style={{ fontSize: 10, color: '#000', fontWeight: 'medium' }}>
        {value}
      </Text>
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
          render={({ pageNumber, totalPages }) => ` ${pageNumber} `}
        />

        <Text style={{ fontSize: 10, color: 'black', fontWeight: 'normal' }}>
          of{' '}
        </Text>
        <Text
          style={{ fontSize: 10, color: 'black', fontWeight: 'semibold' }}
          render={({ pageNumber, totalPages }) => ` ${totalPages}`}
        />
      </View>
    </View>
  );
};

const Header = () => {
  return (
    <View style={styles.header} fixed>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
        Report & Export - Expense
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 22, color: '#0063F7', fontWeight: 'bold' }}>
            tiki
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: '#0063F7',
              fontWeight: 'bold',

              marginBottom: 2, // Adjust this value until perfect
            }}
          >
            Workplace
          </Text>
        </View>
      </View>
    </View>
  );
};
