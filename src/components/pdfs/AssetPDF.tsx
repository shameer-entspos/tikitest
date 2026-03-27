import { SingleAsset } from '@/app/type/single_asset';
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

const AssetPDF = ({ data }: { data: SingleAsset | undefined }) => {
  return (
    <Document title="Asset Details">
      <Page size="A4" orientation="portrait" style={styles.page} wrap>
        <Header data={data} />
        <Footer />
        <View style={styles.content}>
          <OverviewPage data={data} />
          {(data?.photos ?? []).length > 0 && <ImagesPage data={data} />}
        </View>
      </Page>
    </Document>
  );
};

export default AssetPDF;

const OverviewPage = ({ data }: { data: SingleAsset | undefined }) => {
  return (
    <View style={{ flexDirection: 'column' }}>
      {/* Asset Details Section */}
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
          Asset Details
        </Text>
      </View>

      {/* Main Details */}
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
            heading={'Asset Name'}
            value={data?.name ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Reference'}
            value={data?.reference ?? '-'}
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
            heading={'Asset Number'}
            value={data?.atnNum ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Status'}
            value={data?.status ?? '-'}
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
            heading={'Category'}
            value={data?.category?.name ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Subcategory'}
            value={data?.subcategory?.name ?? '-'}
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
            heading={'Make'}
            value={data?.make ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Model'}
            value={data?.model ?? '-'}
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
            heading={'Serial Number'}
            value={data?.serialNumber ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Asset Location'}
            value={data?.assetLocation ?? '-'}
          />
        </View>
      </View>

      {/* Description */}
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

      {/* Purchase Details Section */}
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
          Purchase Details
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
            heading={'Vendor / Supplier'}
            value={data?.vendor ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Ownership Status'}
            value={data?.ownerShipStatus ?? '-'}
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
            heading={'Purchased / Authorized By'}
            value={data?.authorizedBy ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Invoice / Purchase Number'}
            value={data?.invoiceNumber ?? '-'}
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
            heading={'Purchase Date'}
            value={
              data?.purchaseDate
                ? dateFormat(data.purchaseDate.toString())
                : '-'
            }
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Warranty Expiry Date'}
            value={
              data?.expireDate ? dateFormat(data.expireDate.toString()) : '-'
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
            heading={'Purchase Price'}
            value={data?.purchasePrice ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Purchase Note'}
            value={data?.purchaseNote ?? '-'}
          />
        </View>
      </View>

      {/* Maintenance & Retirement Section */}
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
          Maintenance & Retirement
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
            heading={'Maintenance Service Provider'}
            value={data?.serviceProvider ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Retirement Date'}
            value={
              data?.retirementDate
                ? dateFormat(data.retirementDate.toString())
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
            heading={'Retirement Method'}
            value={data?.retirementMethod ?? '-'}
          />
        </View>
        <View style={{ width: '50%' }}>
          <HeadingWithValueColumn
            heading={'Check-in Permission'}
            value={
              data?.checkInpermission === '0'
                ? 'All Organization Users'
                : data?.checkInpermission === '1'
                  ? 'Selected Teams'
                  : '-'
            }
          />
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
            heading={'Submitted By'}
            value={
              data?.submittedBy
                ? `${data.submittedBy.firstName} ${data.submittedBy.lastName}`
                : '-'
            }
          />
        </View>
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

const ImagesPage = ({ data }: { data: SingleAsset | undefined }) => {
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
            textAlign: 'center',
            padding: 5,
          }}
        >
          Asset Photos
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginTop: 10,
        }}
      >
        {(data?.photos ?? []).map((photo, index) => (
          <Image
            key={index}
            src={photo}
            style={{
              width: '48%',
              height: 150,
              marginBottom: 10,
              objectFit: 'cover',
            }}
          />
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

const Header = ({ data }: { data: SingleAsset | undefined }) => {
  return (
    <View style={styles.header} fixed>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Asset Details</Text>
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

