import { Site } from '@/app/type/Sign_Register_Sites';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import {
  Document,
  Image,
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
});

const SitePDF = ({ data }: { data: Site | undefined }) => {
  return (
    <Document title="Manage Site">
      <Page size="A4" orientation="portrait" style={styles.page} wrap>
        <Header data={data} />
        <Footer />
        <View style={styles.content}>
          <OverviewPage data={data} />
        </View>
      </Page>
    </Document>
  );
};

export default SitePDF;

const OverviewPage = ({ data }: { data: Site | undefined }) => {
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
          Site Details
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
            heading={'Site ID'}
            value={data?.siteId ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Site Name'}
            value={data?.siteName ?? '-'}
          />
        </View>
      </View>

      {/* Address */}
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
            heading={'Address Line 1'}
            value={data?.addressLineOne ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Address Line 2'}
            value={data?.addressLineTwo ?? '-'}
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
        <View style={{ width: '33%' }}>
          <HeadingWithValueColumn heading={'City'} value={data?.city ?? '-'} />
        </View>
        <View style={{ width: '33%' }}>
          <HeadingWithValueColumn
            heading={'State'}
            value={data?.state ?? '-'}
          />
        </View>
        <View style={{ width: '33%' }}>
          <HeadingWithValueColumn
            heading={'Postcode'}
            value={data?.code ?? '-'}
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
            heading={'Country'}
            value={data?.country ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Assigned Customer'}
            value={data?.assignedCustomer ?? '-'}
          />
        </View>
      </View>

      {/* Projects */}
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

      {/* Site Managers */}
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
            Site Managers
          </Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              marginTop: 5,
            }}
          >
            {(data?.siteManagers ?? []).map((user, index) => {
              return (
                <Text
                  key={user._id || `manager-${index}`}
                  style={{
                    fontSize: 10,
                    color: '#000',
                    fontWeight: 'semibold',
                  }}
                >
                  {`${user.firstName} ${user.lastName}`}{' '}
                  {user.email ? `(${user.email})` : ''}
                </Text>
              );
            })}
            {(!data?.siteManagers || data.siteManagers.length === 0) && (
              <Text style={{ fontSize: 10, color: '#555' }}>-</Text>
            )}
          </View>
        </View>
      </View>

      {/* Created / Updated */}
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 10,
          marginTop: 20,
        }}
      >
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Created By'}
            value={
              data?.createdBy
                ? `${data.createdBy.firstName} ${data.createdBy.lastName}`
                : '-'
            }
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Updated By'}
            value={
              data?.updatedBy
                ? `${data.updatedBy.firstName} ${data.updatedBy.lastName}`
                : '-'
            }
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
            heading={'Created At'}
            value={
              data?.createdAt
                ? `${dateFormat(data.createdAt.toString())} ${timeFormat(
                    data.createdAt.toString()
                  )}`
                : '-'
            }
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Updated At'}
            value={
              data?.updatedAt
                ? `${dateFormat(data.updatedAt.toString())} ${timeFormat(
                    data.updatedAt.toString()
                  )}`
                : '-'
            }
          />
        </View>
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

const Header = ({ data }: { data: Site | undefined }) => {
  return (
    <View style={styles.header} fixed>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Manage Site</Text>
      <Text style={{ fontSize: 9, color: '#555' }}>
        Last Modified:{' '}
        {data?.updatedAt
          ? `${dateFormat(data.updatedAt.toString())} ${timeFormat(
              data.updatedAt.toString()
            )}`
          : '-'}
      </Text>
    </View>
  );
};
