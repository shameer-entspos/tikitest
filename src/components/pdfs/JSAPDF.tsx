import { JSAAppModel } from '@/app/(main)/(user-panel)/user/apps/api';
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
    paddingTop: 60, // Reserve space for header
    paddingBottom: 60, // Reserve space for footer
    paddingHorizontal: 40,
    fontSize: 12,
  },
  image: {
    width: 200,
    height: 200,
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
});
const JSAPDF = ({ data }: { data: JSAAppModel | undefined }) => {
  const largeContent = Array.from({ length: 100 }, (_, i) => `Line ${i + 1}`);

  return (
    <Document title="Job Safety Analysis">
      <Page size="A4" orientation="landscape" style={styles.page} wrap>
        {/* Header */}

        <Header data={data} />

        {/* Footer */}
        <Footer />

        {/* Main Content */}

        <View style={styles.content}>
          <Page1 data={data} />
          {/* page 2  */}
          <PageSteps data={data} />
          {/* page 3  */}
          <PageEmergencyPlan data={data} />

          {/* {page 4} */}
          {(data?.images ?? []).length > 0 && <PageImages data={data} />}
        </View>
      </Page>
    </Document>
  );
};

export default JSAPDF;

const Page1 = ({ data }: { data: JSAAppModel | undefined }) => {
  return (
    <View style={{ flexDirection: 'column' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <HeadingWithValueColumn
          heading={'Submission ID'}
          value={data?.submissionId ?? ''}
        />
        <HeadingWithValueColumn
          heading={'Organization Name'}
          value={data?.organizationId?.name ?? ''}
        />

        <HeadingWithValueColumn
          heading={'Created By'}
          value={
            `${data?.createdBy?.firstName ?? ''} ${data?.createdBy?.lastName ?? ''}`.trim() ||
            '-'
          }
        />

        <HeadingWithValueColumn
          heading={'Last Modified:'}
          value={
            `${data?.updatedBy?.firstName ?? ''} ${data?.updatedBy?.lastName ?? ''}`.trim() ||
            '-'
          }
        />
      </View>

      {/* JSA DETAIL Heading  with blue bg */}
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
          JSA Details
        </Text>
      </View>

      {/* /// Further details in two column */}
      {/* First ROw  */}
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
            heading={'Customer Name'}
            value={'My Organization'}
          />
        </View>

        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn heading={'Reference'} value={'-'} />
        </View>
      </View>
      {/* Second Row  */}
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
            heading={'JSA Name'}
            value={data?.name ?? ''}
          />
        </View>

        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn heading={'Date of Activities'} value={'-'} />
        </View>
      </View>
      {/* Third Row  */}
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
            heading={'Contact Name'}
            value={data?.contactName ?? ''}
          />
        </View>

        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Phone Number'}
            value={data?.phone?.toString() ?? ''}
          />
        </View>
      </View>
      {/* Fourth row  */}
      <View
        style={{
          width: '100%',
          height: 120,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          marginVertical: 10,
        }}
      >
        <Text style={{ fontSize: 9, color: '#555', fontWeight: 'bold' }}>
          {'Managers / Supervisors'}
        </Text>
        <View
          style={{
            width: '100%',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {(data?.managers ?? []).map((manager: any, managerIndex: number) => {
            return (
              <View
                key={manager._id || `manager-${managerIndex}`}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ width: '50%' }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#000',
                      fontWeight: 'semibold',
                    }}
                  >
                    {`${manager.firstName} ${manager.lastName}`}
                  </Text>
                </View>
                <View style={{ width: '50%' }}>
                  <Text style={{ fontSize: 10, color: '#555' }}>
                    {manager.email}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};
const PageSteps = ({ data }: { data: JSAAppModel | undefined }) => {
  const list = ['Negligible', 'Minor', 'Moderate', 'Significant', 'Severe'];
  const risks = ['Negligible', 'Minor', 'Moderate', 'Significant', 'Severe'];
  return (
    <View>
      {(data?.steps ?? []).map((step, i) => {
        return (
          <View
            style={{ flexDirection: 'column', height: '100%' }}
            break
            key={i}
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
                Step {i + 1}
              </Text>
            </View>
            {/* Description  */}
            <HeadingWithValueColumn
              heading={'Activity Description'}
              value={step.description ?? ''}
            />

            {/* PPE & Safety Gear Required  */}
            <HeadingWithValueColumn
              heading={'PPE & Safety Gear Required'}
              value={
                (step.PPEs ?? [])
                  .map((p) => p.name ?? '')
                  .filter(Boolean)
                  .join(', ') || ''
              }
            />
            {/* Hazar and risk name  */}
            {(step.Hazards ?? []).map((h, hazardIndex) => {
              return (
                <View
                  style={{ flexDirection: 'column' }}
                  key={h._id || `step-${i}-hazard-${hazardIndex}`}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      backgroundColor: '#F6C6AC',
                      marginVertical: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#555',
                        fontWeight: 'semibold',
                        textAlign: 'center',
                        padding: 5,
                      }}
                    >
                      Hazard & Risk Name
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#000',
                      fontWeight: 'bold',
                      textAlign: 'left',
                      padding: 5,
                    }}
                  >
                    {h.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <HeadingWithValueColumn
                      heading={'Hazard Description'}
                      value={h.controlMethod ?? ''}
                    />
                    <HeadingWithValueColumn
                      heading={'Initial Risk Assessment'}
                      value={
                        h.initialRiskAssessment != null &&
                        list[h.initialRiskAssessment]
                          ? list[h.initialRiskAssessment].toString()
                          : ''
                      }
                    />
                    <HeadingWithValueColumn
                      heading={'Residual Risk Assessment'}
                      value={
                        h.residualRiskAssessment != null &&
                        risks[h.residualRiskAssessment]
                          ? risks[h.residualRiskAssessment].toString()
                          : ''
                      }
                    />
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

const PageEmergencyPlan = ({ data }: { data: JSAAppModel | undefined }) => {
  return (
    <View style={{ flexDirection: 'column' }} break>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: 'red',
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
          Emergency Plan
        </Text>
      </View>
      <HeadingWithValueColumn
        heading={'Evacuation Area'}
        value={data?.evacuationArea ?? ''}
      />
      <HeadingWithValueColumn
        heading={'Evacuation & Emergency Procedures.'}
        value={data?.evacuationProcedure ?? ''}
      />
      <View style={{ flexDirection: 'column' }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ width: '50%' }}>
            <Text
              style={{
                fontSize: 10,
                color: '#555',
              }}
            >
              {`Emergency Contact Name `}
            </Text>
          </View>
          <View style={{ width: '50%' }}>
            <Text style={{ fontSize: 10, color: '#555' }}>
              {'Emergency Contact Phone Number'}
            </Text>
          </View>
        </View>
        {(data?.emergencyContact ?? []).map((contact, i) => {
          return (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ width: '50%' }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#000',
                    fontWeight: 'semibold',
                  }}
                >
                  {`${contact.name} `}
                </Text>
              </View>
              <View style={{ width: '50%' }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#000',
                    fontWeight: 'semibold',
                  }}
                >
                  {contact.phone}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const PageImages = ({ data }: { data: JSAAppModel | undefined }) => {
  return (
    <View style={{ flexDirection: 'column' }} break>
      {(data?.images ?? []).map((image, i) => {
        return (
          <Image
            key={i}
            src={image}
            style={{ width: '100%', height: 'auto' }}
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

const Header = ({ data }: { data: JSAAppModel | undefined }) => {
  //  <View style={styles.header} fixed>
  //         <Text>My PDF Header</Text>
  //       </View>
  return (
    <View style={styles.header} fixed>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
        Job Safety Analysis
      </Text>
      <Text style={{ fontSize: 9, color: '#555' }}>
        Last Modified: {dateFormat(data?.updatedAt!)}{' '}
        {timeFormat(data?.updatedAt!)}
      </Text>
    </View>
  );
};
