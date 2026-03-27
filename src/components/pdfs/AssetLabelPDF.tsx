import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

/**
 * Single-page asset label PDF: thin black border, QR code (left),
 * Asset ID and Organization name (right). QR encodes asset detail URL for scanning.
 * Page: 5" x 3" with generous padding so the label doesn't look cramped.
 */
const LABEL_WIDTH_PT = 480; // ~5.3 in – extra width for right padding
const LABEL_HEIGHT_PT = 220; // ~3 in
const PADDING_PT = 28; // padding on all sides (inside border)
const TEXT_RIGHT_PADDING_PT = 0; // extra space so text doesn’t touch right edge

const styles = StyleSheet.create({
  page: {
    width: LABEL_WIDTH_PT,
    height: LABEL_HEIGHT_PT,
    padding: PADDING_PT,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  qrWrap: {
    width: 140,
    height: 140,
    marginRight: 20,
  },
  qr: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
    paddingRight: TEXT_RIGHT_PADDING_PT,
    minWidth: 0, // allow flex item to shrink so padding is visible
  },
  assetId: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  orgName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Helvetica-Bold',
  },
});

export default function AssetLabelPDF({
  qrDataUrl,
  assetId,
  organizationName,
}: {
  qrDataUrl: string;
  assetId: string;
  organizationName: string;
}) {
  return (
    <Document title="Asset Label">
      <Page size={[LABEL_WIDTH_PT, LABEL_HEIGHT_PT]} style={styles.page}>
        <View style={styles.qrWrap}>
          <Image src={qrDataUrl} style={styles.qr} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.assetId}>{assetId || '—'}</Text>
          <Text style={styles.orgName}>{organizationName || '—'}</Text>
        </View>
      </Page>
    </Document>
  );
}
