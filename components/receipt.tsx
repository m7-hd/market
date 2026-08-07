'use client';

import * as React from 'react';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode';

interface PrintableReceiptProps {
  txnNumber: string;
  type: string;
  customerName?: string;
  phone: string;
  amount: number;
  fee: number;
  commission: number;
  netAmount: number;
  employeeName: string;
  status: string;
  date: string;
  businessName?: string;
  businessPhone?: string;
}

/**
 * Hook to render + print a Vodafone Cash receipt.
 */
export function useReceiptPrinter() {
  const [qrDataUrl, setQrDataUrl] = React.useState<string>('');
  const printRef = React.useRef<HTMLDivElement>(null);

  const generateQR = async (data: string) => {
    try {
      const url = await QRCode.toDataURL(data, { width: 200, margin: 1 });
      setQrDataUrl(url);
      return url;
    } catch {
      return '';
    }
  };

  const print = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'إيصال فودافون كاش',
  });

  const printReceipt = async (props: PrintableReceiptProps) => {
    await generateQR(JSON.stringify({
      txn: props.txnNumber, type: props.type, amount: props.amount, phone: props.phone,
    }));
    // Need to render the ref content first, then print on next tick
    setPendingProps(props);
    setTimeout(() => print(), 300);
  };

  const [pendingProps, setPendingProps] = React.useState<PrintableReceiptProps | null>(null);

  const ReceiptComponent = pendingProps ? (
    <div style={{ display: 'none' }}>
      <div ref={printRef}>
        <ReceiptContent {...pendingProps} qrDataUrl={qrDataUrl} />
      </div>
    </div>
  ) : null;

  return { printReceipt, ReceiptComponent };
}

function ReceiptContent({ txnNumber, type, customerName, phone, amount, fee, commission, netAmount, employeeName, status, date, businessName = 'محمـد ماركت', businessPhone = '01000000000', qrDataUrl }: PrintableReceiptProps & { qrDataUrl: string }) {
  const typeLabels: Record<string, string> = {
    deposit: 'إيداع للمحفظة',
    withdraw: 'سحب من المحفظة',
    transfer: 'تحويل لمحفظة',
    bill_payment: 'دفع فاتورة',
  };
  const d = new Date(date);
  return (
    <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl', width: '80mm', padding: '8px', color: '#000', background: '#fff' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>{businessName}</h1>
        <p style={{ fontSize: '11px', margin: '2px 0' }}>هاتف: {businessPhone}</p>
        <p style={{ fontSize: '14px', fontWeight: 700, margin: '4px 0', background: '#e60000', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
          📱 فودافون كاش - {typeLabels[type] || type}
        </p>
      </div>

      <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
        <Row label="رقم العملية" value={txnNumber} bold />
        <Row label="التاريخ" value={d.toLocaleDateString('ar-EG')} />
        <Row label="الوقت" value={d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} />
        <Row label="اسم العميل" value={customerName || '—'} />
        <Row label="رقم الهاتف" value={phone} bold />
        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
        <Row label="المبلغ" value={`${amount.toFixed(2)} ج.م`} bold />
        {fee > 0 && <Row label="الرسوم" value={`${fee.toFixed(2)} ج.م`} />}
        {commission > 0 && <Row label="العمولة" value={`${commission.toFixed(2)} ج.م`} />}
        <Row label="الصافي" value={`${netAmount.toFixed(2)} ج.م`} bold />
        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
        <Row label="الموظف" value={employeeName} />
        <Row label="الحالة" value={status === 'success' ? '✅ ناجحة' : status === 'pending' ? '⏳ معلقة' : '❌ فاشلة'} />
      </div>

      {qrDataUrl && (
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <img src={qrDataUrl} alt="QR" style={{ width: '120px', height: '120px' }} />
          <p style={{ fontSize: '10px', margin: '4px 0' }}>امسح للتحقق</p>
        </div>
      )}

      <div style={{ textAlign: 'center', borderTop: '2px dashed #000', paddingTop: '8px', marginTop: '8px', fontSize: '11px' }}>
        <p style={{ margin: '2px 0' }}>شكراً لتعاملكم معنا 🙏</p>
        <p style={{ margin: '2px 0', fontSize: '10px', color: '#666' }}>{businessName} · نظام إدارة احترافي</p>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontWeight: bold ? 700 : 400 }}>{label}:</span>
      <span style={{ fontWeight: bold ? 800 : 500 }}>{value}</span>
    </div>
  );
}
