import { RollCall } from '@/app/type/roll_call';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
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
  tableColName: {
    width: '30%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColEmail: {
    width: '30%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColPhone: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColStatus: {
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

const ROLL_CALL_PDF = ({ data }: { data: RollCall | undefined }) => {
  return (
    <Document title="Roll Call Report">
      <Page size="A4" orientation="portrait" style={styles.page} wrap>
        <Header data={data} />
        <Footer />
        <View style={styles.content}>
          <OverviewPage data={data} />
          {(data?.users ?? []).length > 0 && (
            <AttendancePage data={data} />
          )}
        </View>
      </Page>
    </Document>
  );
};

export { ROLL_CALL_PDF };

const OverviewPage = ({ data }: { data: RollCall | undefined }) => {
  return (
    <View style={{ flexDirection: 'column' }}>
      {/* Entry Details Section */}
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
          Entry Details
        </Text>
      </View>

      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 10,
        }}
      >
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Entry ID'}
            value={data?.rollNumber?.toString() ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Entry Name'}
            value={data?.title ?? '-'}
          />
        </View>
      </View>

      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 10,
        }}
      >
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Submission Name'}
            value={'Roll Call'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Submitted By'}
            value={
              data?.submittedBy
                ? `${data.submittedBy.firstName} ${data.submittedBy.lastName}`
                : '-'
            }
          />
        </View>
      </View>

      {/* Assigned Projects */}
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 10,
        }}
      >
        <View style={{ width: '100%' }}>
          <Text style={{ fontSize: 9, color: '#555', fontWeight: 'bold' }}>
            Assigned Projects
          </Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              marginTop: 5,
            }}
          >
            {(data?.projects ?? []).map((project, index) => {
              return (
                <Text
                  key={project._id || `project-${index}`}
                  style={{
                    fontSize: 10,
                    color: '#000',
                    fontWeight: 'semibold',
                  }}
                >
                  {project.name ?? '-'}
                </Text>
              );
            })}
            {(!data?.projects || data.projects.length === 0) && (
              <Text style={{ fontSize: 10, color: '#555' }}>-</Text>
            )}
          </View>
        </View>
      </View>

      {/* Selected Sites */}
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 10,
        }}
      >
        <View style={{ width: '100%' }}>
          <Text style={{ fontSize: 9, color: '#555', fontWeight: 'bold' }}>
            Selected Sites
          </Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              marginTop: 5,
            }}
          >
            {(data?.sites ?? []).map((site, index) => {
              return (
                <Text
                  key={site._id || `site-${index}`}
                  style={{
                    fontSize: 10,
                    color: '#000',
                    fontWeight: 'semibold',
                  }}
                >
                  {site.siteName ?? '-'}
                </Text>
              );
            })}
            {(!data?.sites || data.sites.length === 0) && (
              <Text style={{ fontSize: 10, color: '#555' }}>-</Text>
            )}
          </View>
        </View>
      </View>

      {/* Roll Call Details */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: '#0063F7',
          marginVertical: 10,
          marginTop: 20,
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
          Roll Call Details
        </Text>
      </View>

      <View
        style={{
          width: '100%',
          flexDirection: 'column',
          marginVertical: 10,
        }}
      >
        <HeadingWithValueColumn
          heading={'Topic Title'}
          value={data?.title ?? '-'}
        />
        <View
          style={{
            flexDirection: 'column',
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 9, color: '#555', fontWeight: 'bold' }}>
            Description
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: '#000',
              fontWeight: 'medium',
              marginTop: 5,
            }}
          >
            {data?.description ?? '-'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const AttendancePage = ({ data }: { data: RollCall | undefined }) => {
  const presentCount = (data?.users ?? []).filter(
    (u) => u.status === 'present'
  ).length;
  const totalCount = (data?.users ?? []).length;

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: '#0063F7',
          marginVertical: 10,
          marginTop: 20,
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
          Attendance ({presentCount}/{totalCount})
        </Text>
      </View>

      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={[styles.tableColHeader, styles.tableColName]}>
            <Text style={styles.tableCellHeader}>Name</Text>
          </View>
          <View style={[styles.tableColHeader, styles.tableColEmail]}>
            <Text style={styles.tableCellHeader}>Email</Text>
          </View>
          <View style={[styles.tableColHeader, styles.tableColPhone]}>
            <Text style={styles.tableCellHeader}>Phone</Text>
          </View>
          <View style={[styles.tableColHeader, styles.tableColStatus]}>
            <Text style={styles.tableCellHeader}>Status</Text>
          </View>
        </View>

        {/* Table Rows */}
        {(data?.users ?? []).map((user, index) => (
          <View key={user._id || `user-${index}`} style={styles.tableRow}>
            <View style={[styles.tableCol, styles.tableColName]}>
              <Text style={styles.tableCell}>
                {`${user.firstName || ''} ${user.lastName || ''}`.trim() || '-'}
              </Text>
            </View>
            <View style={[styles.tableCol, styles.tableColEmail]}>
              <Text style={styles.tableCell}>{user.email || '-'}</Text>
            </View>
            <View style={[styles.tableCol, styles.tableColPhone]}>
              <Text style={styles.tableCell}>{user.phone || '-'}</Text>
            </View>
            <View style={[styles.tableCol, styles.tableColStatus]}>
              <Text style={styles.tableCell}>
                {user.status === 'present' ? 'Present' : 'Absent'}
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

const Header = ({ data }: { data: RollCall | undefined }) => {
  return (
    <View style={styles.header} fixed>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Roll Call Report</Text>
      <Text style={{ fontSize: 9, color: '#555' }}>
        Last Modified:{' '}
        {data?.updatedAt
          ? `${dateFormat(data.updatedAt.toString())} ${timeFormat(data.updatedAt.toString())}`
          : '-'}
      </Text>
    </View>
  );
};
