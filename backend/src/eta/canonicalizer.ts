import crypto from 'crypto';
import QRCode from 'qrcode';

export interface ETALineItem {
  itemCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
}

export interface ETADocumentPayload {
  internalId: string;
  issuerTrn: string;
  issuerName: string;
  receiverTrn: string;
  receiverName: string;
  documentType: 'B2B_INVOICE' | 'B2C_RECEIPT';
  dateTimeIssued: string;
  items: ETALineItem[];
  totalNetAmount: number;
  totalVatAmount: number;
  totalAmount: number;
}

export class ETACanonicalizer {
  /**
   * Validates Egyptian Tax Registration Number (TRN) format (9 digits)
   */
  public static validateTRN(trn: string): boolean {
    if (!trn) return false;
    const digitsOnly = trn.replace(/[^0-9]/g, '');
    return digitsOnly.length === 9;
  }

  /**
   * Transforms invoice payload into standard ETA v1.0 Canonical JSON String
   * ETA canonicalization rule: Serialize attributes recursively without whitespace formatting
   */
  public static toCanonicalJson(doc: ETADocumentPayload): string {
    const canonicalObj = {
      "ISSUER": {
        "TRN": doc.issuerTrn.replace(/[^0-9]/g, ''),
        "NAME": doc.issuerName.trim()
      },
      "RECEIVER": {
        "TRN": doc.receiverTrn.replace(/[^0-9]/g, ''),
        "NAME": doc.receiverName.trim()
      },
      "DOCUMENTTYPE": doc.documentType,
      "INTERNALID": doc.internalId,
      "DATETIMEISSUED": doc.dateTimeIssued,
      "LINEITEMS": doc.items.map(item => ({
        "ITEMCODE": item.itemCode,
        "DESCRIPTION": item.description,
        "QUANTITY": item.quantity.toFixed(2),
        "UNITPRICE": item.unitPrice.toFixed(2),
        "NETAMOUNT": item.netAmount.toFixed(2),
        "VATRATE": (item.vatRate * 100).toFixed(2) + "%",
        "VATAMOUNT": item.vatAmount.toFixed(2),
        "TOTALAMOUNT": item.totalAmount.toFixed(2)
      })),
      "TOTALNETAMOUNT": doc.totalNetAmount.toFixed(2),
      "TOTALVATAMOUNT": doc.totalVatAmount.toFixed(2),
      "TOTALAMOUNT": doc.totalAmount.toFixed(2)
    };

    return JSON.stringify(canonicalObj);
  }

  /**
   * Transforms invoice payload into ETA v1.0 Canonical XML String
   */
  public static toCanonicalXml(doc: ETADocumentPayload): string {
    const cleanIssuerTrn = doc.issuerTrn.replace(/[^0-9]/g, '');
    const cleanReceiverTrn = doc.receiverTrn.replace(/[^0-9]/g, '');

    const lineItemsXml = doc.items.map(item => `
    <InvoiceLine>
      <ItemCode>${item.itemCode}</ItemCode>
      <Description>${item.description}</Description>
      <Quantity>${item.quantity.toFixed(2)}</Quantity>
      <UnitPrice>${item.unitPrice.toFixed(2)}</UnitPrice>
      <NetAmount>${item.netAmount.toFixed(2)}</NetAmount>
      <VatAmount>${item.vatAmount.toFixed(2)}</VatAmount>
      <TotalAmount>${item.totalAmount.toFixed(2)}</TotalAmount>
    </InvoiceLine>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:eta:params:xml:ns:v1.0">
  <Header>
    <InternalId>${doc.internalId}</InternalId>
    <DocumentType>${doc.documentType}</DocumentType>
    <DateTimeIssued>${doc.dateTimeIssued}</DateTimeIssued>
  </Header>
  <Issuer>
    <TRN>${cleanIssuerTrn}</TRN>
    <Name>${doc.issuerName}</Name>
  </Issuer>
  <Receiver>
    <TRN>${cleanReceiverTrn}</TRN>
    <Name>${doc.receiverName}</Name>
  </Receiver>
  <LineItems>${lineItemsXml}
  </LineItems>
  <Summary>
    <TotalNetAmount>${doc.totalNetAmount.toFixed(2)}</TotalNetAmount>
    <TotalVatAmount>${doc.totalVatAmount.toFixed(2)}</TotalVatAmount>
    <TotalAmount>${doc.totalAmount.toFixed(2)}</TotalAmount>
  </Summary>
</Document>`.trim();
  }

  /**
   * Generates SHA-256 digest hash from canonical payload string
   */
  public static computeSHA256Hash(canonicalPayload: string): string {
    return crypto.createHash('sha256').update(canonicalPayload, 'utf8').digest('hex');
  }

  /**
   * Generates dynamic Base64 QR Code image data URL for B2C E-Receipt verification
   */
  public static async generateVerificationQRCode(etaUuid: string): Promise<string> {
    const verificationUrl = `https://invoicing.eta.gov.eg/receipts/search/${etaUuid}`;
    try {
      return await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('Error generating QR Code:', err);
      return '';
    }
  }
}
