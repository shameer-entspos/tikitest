import { LiveBoard } from '@/app/type/live_board';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontSize: 12,
  },
  image: {
    width: 200,
    height: 200,
    objectFit: 'cover',
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

const LiveBoardPDF = ({ data }: { data: LiveBoard | undefined }) => {
  return (
    <Document title="Hazard & Incident">
      <Page size="A4" orientation="portrait" style={styles.page} wrap>
        <Header data={data} />
        <Footer />
        <View style={styles.content}>
          <OverviewPage data={data} />
          {(data?.images ?? []).length > 0 && <ImagesPage data={data} />}
        </View>
      </Page>
    </Document>
  );
};

export default LiveBoardPDF;

const OverviewPage = ({ data }: { data: LiveBoard | undefined }) => {
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
            value={data?.referenceId ?? '-'}
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
            value={'Hazard & Incident'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Hazard or Incident'}
            value={data?.isHazardOrIncident ?? '-'}
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

      {/* Status */}
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
            heading={'Status'}
            value={data?.status ?? '-'}
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

      {/* Details Section */}
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
          Details
        </Text>
      </View>

      <View
        style={{
          width: '100%',
          flexDirection: 'column',
          marginVertical: 10,
        }}
      >
        <HeadingWithValueColumn heading={'Title'} value={data?.title ?? '-'} />
        <HeadingWithValueColumn
          heading={'Location'}
          value={data?.address ?? '-'}
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

      {/* Dates */}
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
            heading={'Created At'}
            value={
              data?.createdAt
                ? `${dateFormat(data.createdAt.toString())} ${timeFormat(data.createdAt.toString())}`
                : '-'
            }
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Updated At'}
            value={
              data?.updatedAt
                ? `${dateFormat(data.updatedAt.toString())} ${timeFormat(data.updatedAt.toString())}`
                : '-'
            }
          />
        </View>
      </View>
    </View>
  );
};

const ImagesPage = ({ data }: { data: LiveBoard | undefined }) => {
  return (
    <View style={{ flexDirection: 'column' }} break>
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
          Photos
        </Text>
      </View>
      {(data?.images ?? []).map((image, i) => {
        return (
          <Image
            key={i}
            src={image}
            style={{ width: '100%', height: 'auto', marginVertical: 5 }}
          />
        );
      })}
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

const Header = ({ data }: { data: LiveBoard | undefined }) => {
  return (
    <View style={styles.header} fixed>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
        Hazard & Incident
      </Text>
      <Text style={{ fontSize: 9, color: '#555' }}>
        Last Modified:{' '}
        {data?.updatedAt
          ? `${dateFormat(data.updatedAt.toString())} ${timeFormat(data.updatedAt.toString())}`
          : '-'}
      </Text>
    </View>
  );
};
