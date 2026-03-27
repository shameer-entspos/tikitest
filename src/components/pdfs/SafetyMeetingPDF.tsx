import { SafetyMeetings } from '@/app/type/safety_meeting';
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

const SafetyMeetingPDF = ({ data }: { data: SafetyMeetings | undefined }) => {
  return (
    <Document title="Safety Meeting Report">
      <Page size="A4" orientation="portrait" style={styles.page} wrap>
        <Header data={data} />
        <Footer />
        <View style={styles.content}>
          <OverviewPage data={data} />
          {(data?.attendance ?? []).length > 0 && (
            <AttendancePage data={data} />
          )}
          {(data?.topics ?? []).length > 0 && (
            <DiscussionTopicsPage data={data} />
          )}
        </View>
      </Page>
    </Document>
  );
};

export default SafetyMeetingPDF;

const OverviewPage = ({ data }: { data: SafetyMeetings | undefined }) => {
  // Extract leader name and email from leader string
  const getLeaderName = () => {
    if (!data?.leader) return '-';
    const parts = data.leader.split(' - ');
    return parts[0] || data.leader;
  };

  const getLeaderEmail = () => {
    if (!data?.leader) return '';
    const parts = data.leader.split(' - ');
    return parts[1] || '';
  };

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
            value={data?.entryId ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Entry Name'}
            value={data?.name ?? '-'}
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
            value={'Safety Meeting'}
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

      {/* Meeting Overview Section */}
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
          Meeting Overview
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
          heading={'Meeting Name'}
          value={data?.name ?? '-'}
        />
        <HeadingWithValueColumn
          heading={'Safety Leader'}
          value={
            getLeaderEmail()
              ? `${getLeaderName()} - ${getLeaderEmail()}`
              : getLeaderName()
          }
        />
        <View
          style={{
            flexDirection: 'column',
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 9, color: '#555', fontWeight: 'bold' }}>
            Agenda
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: '#000',
              fontWeight: 'medium',
              marginTop: 5,
            }}
          >
            {data?.agenda ?? '-'}
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

const AttendancePage = ({ data }: { data: SafetyMeetings | undefined }) => {
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
          Attendance
        </Text>
      </View>

      <View
        style={{
          width: '100%',
          flexDirection: 'column',
          marginTop: 10,
        }}
      >
        {(data?.attendance ?? []).map((person, index) => {
          return (
            <View
              key={person._id || `attendance-${index}`}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginVertical: 5,
                paddingVertical: 5,
                borderBottom: '1px solid #eee',
              }}
            >
              <View style={{ width: '40%' }}>
                <Text style={{ fontSize: 10, color: '#000', fontWeight: 'medium' }}>
                  {`${person.firstName} ${person.lastName}`}
                </Text>
              </View>
              <View style={{ width: '35%' }}>
                <Text style={{ fontSize: 10, color: '#000', fontWeight: 'medium' }}>
                  {person.email ?? '-'}
                </Text>
              </View>
              <View style={{ width: '25%' }}>
                <Text style={{ fontSize: 10, color: '#555' }}>
                  {person?.organization?.name ?? '-'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const DiscussionTopicsPage = ({
  data,
}: {
  data: SafetyMeetings | undefined;
}) => {
  return (
    <>
      {(data?.topics ?? []).map((topic, topicIndex) => {
        const hasImages = (topic.images ?? []).length > 0;
        return (
          <>
            <View key={topic._id || `topic-${topicIndex}`} style={{ flexDirection: 'column' }} break>
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
                  Discussion Topic {topicIndex + 1}
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
                    heading={'Discussion Topic'}
                    value={topic.title ?? '-'}
                  />
                </View>
                <View style={{ width: '50%' }}>
                  <HeadingWithValueColumn
                    heading={'Category'}
                    value={topic.category ?? '-'}
                  />
                </View>
              </View>

              <View
                style={{
                  width: '100%',
                  flexDirection: 'column',
                  marginVertical: 10,
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
                  {topic.description ?? '-'}
                </Text>
              </View>

              {topic.resolution && (
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'column',
                    marginVertical: 10,
                  }}
                >
                  <Text style={{ fontSize: 9, color: '#555', fontWeight: 'bold' }}>
                    Resolution
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#000',
                      fontWeight: 'medium',
                      marginTop: 5,
                    }}
                  >
                    {topic.resolution}
                  </Text>
                </View>
              )}

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
                    heading={'Submitted By'}
                    value={
                      topic?.submittedBy
                        ? `${topic.submittedBy.firstName} ${topic.submittedBy.lastName}`
                        : '-'
                    }
                  />
                </View>
                <View style={{ width: '50%' }}>
                  <HeadingWithValueColumn
                    heading={'Status'}
                    value={topic.status ?? '-'}
                  />
                </View>
              </View>
            </View>

            {hasImages && (
              <View
                key={`topic-images-${topic._id || topicIndex}`}
                style={{ flexDirection: 'column' }}
                break
              >
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
                    Photos - Discussion Topic {topicIndex + 1}
                  </Text>
                </View>
                {(topic.images ?? []).map((image, imageIndex) => {
                  return (
                    <Image
                      key={imageIndex}
                      src={image}
                      style={{
                        width: '100%',
                        height: 'auto',
                        marginVertical: 5,
                      }}
                    />
                  );
                })}
              </View>
            )}
          </>
        );
      })}
    </>
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

const Header = ({ data }: { data: SafetyMeetings | undefined }) => {
  return (
    <View style={styles.header} fixed>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
        Safety Meeting Report
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

