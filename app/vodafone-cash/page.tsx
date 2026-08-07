'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Smartphone, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Receipt,
  Search, Printer, Wallet, TrendingUp, TrendingDown, Repeat, FileText,
  CheckCircle2, Clock, XCircle, QrCode, Filter, Download, Eye,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader, EmptyState } from '@/components/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sheet } from '@/components/ui/sheet';
import { useVodafoneStore } from '@/stores/vodafone-store';
import { useAuthStore } from '@/stores/auth-store';
import { useReceiptPrinter } from '@/components/receipt';
import { formatCurrency, formatDate, formatTime, cn } from '@/lib/utils';
import type { VodafoneCashTxn, VodafoneTxnType, VodafoneTxnStatus } from '@/types';

const typeConfig: Record<VodafoneTxnType, { label: string; icon: any; gradient: string; color: string }> = {
  deposit: { label: 'إيداع', icon: ArrowDownToLine, gradient: 'from-emerald2-500 to-emerald2-600', color: 'text-emerald2-500' },
  withdraw: { label: 'سحب', icon: ArrowUpFromLine, gradient: 'from-vodafone to-vodafone-light', color: 'text-vodafone' },
  transfer: { label: 'تحويل', icon: ArrowLeftRight, gradient: 'from-royal to-royal-light', color: 'text-royal' },
  bill_payment: { label: 'دفع فاتورة', icon: Receipt, gradient: 'from-brand-500 to-gold-400', color: 'text-brand-500' },
};

const statusConfig: Record<VodafoneTxnStatus, { label: string; icon: any; variant: any }> = {
  success: { label: 'ناجحة', icon: CheckCircle2, variant: 'success' },
  pending: { label: 'معلقة', icon: Clock, variant: 'warning' },
  failed: { label: 'فاشلة', icon: XCircle, variant: 'destructive' },
  cancelled: { label: 'ملغاة', icon: XCircle, variant: 'outline' },
};

export default function VodafoneCashPage() {
  const { balance, transactions, addTransaction, cancelTransaction, getTodayStats, getByPhone, adjustBalance } = useVodafoneStore();
  const { user } = useAuthStore();
  const { printReceipt, ReceiptComponent } = useReceiptPrinter();

  const [activeSheet, setActiveSheet] = React.useState<VodafoneTxnType | 'statement' | null>(null);
  const [searchPhone, setSearchPhone] = React.useState('');
  const [filterType, setFilterType] = React.useState<string>('all');
  const [selectedTxn, setSelectedTxn] = React.useState<VodafoneCashTxn | null>(null);

  const stats = getTodayStats();
  const filteredTxns = React.useMemo(() => {
    let txns = transactions;
    if (searchPhone) txns = getByPhone(searchPhone);
    if (filterType !== 'all') txns = txns.filter((t) => t.type === filterType);
    return txns;
  }, [transactions, searchPhone, filterType]);

  const handlePrint = (txn: VodafoneCashTxn) => {
    printReceipt({
      txnNumber: txn.txn_number,
      type: txn.type,
      customerName: txn.customer_name,
      phone: txn.phone,
      amount: txn.amount,
      fee: txn.fee,
      commission: txn.commission,
      netAmount: txn.net_amount,
      employeeName: txn.employee_name || user?.full_name || 'النظام',
      status: txn.status,
      date: txn.created_at,
    });
    toast.success('تم تجهيز الإيصال للطباعة');
  };

  return (
    <DashboardLayout title="فودافون كاش">
      {ReceiptComponent}

      <PageHeader
        title="نظام فودافون كاش المتكامل"
        description="إدارة كاملة لعمليات الإيداع والسحب والتحويل ودفع الفواتير"
        icon={<Smartphone className="h-7 w-7" />}
        gradient="from-vodafone to-vodafone-light"
        actions={
          <Button variant="vodafone" onClick={() => setActiveSheet('statement')}>
            <FileText className="h-4 w-4" />
            كشف حساب كامل
          </Button>
        }
      />

      {/* Balance hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl mb-6"
      >
        <div className="relative bg-gradient-vodafone p-8 text-white overflow-hidden">
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/80 text-sm mb-1 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                رصيد محفظة فودافون كاش
              </p>
              <motion.p
                key={balance}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-black number-ticker"
              >
                {formatCurrency(balance)}
              </motion.p>
              <p className="text-white/70 text-sm mt-2">رقم المحفظة: 01000000000</p>
            </div>
            <div className="text-left">
              <p className="text-white/80 text-sm">آخر تحديث</p>
              <p className="text-xl font-bold">{formatTime(new Date().toISOString())}</p>
              <Badge className="mt-2 bg-white/20 text-white border-0">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse mr-1" />
                متصل
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="إجمالي السحب اليوم" value={stats.withdrawals} suffix=" ج.م" icon={<TrendingDown className="h-6 w-6" />} gradient="vodafone" delay={0} />
        <StatCard title="إجمالي الإيداع اليوم" value={stats.deposits} suffix=" ج.م" icon={<TrendingUp className="h-6 w-6" />} gradient="emerald" delay={0.1} />
        <StatCard title="إجمالي التحويلات" value={stats.transfers} suffix=" ج.م" icon={<Repeat className="h-6 w-6" />} gradient="royal" delay={0.2} />
        <StatCard title="عمولات اليوم" value={stats.commissions} suffix=" ج.م" icon={<Wallet className="h-6 w-6" />} gradient="gold" delay={0.3} />
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {([
          { type: 'deposit' as VodafoneTxnType, label: 'إيداع للمحفظة', icon: ArrowDownToLine, gradient: 'from-emerald2-500 to-emerald2-600' },
          { type: 'withdraw' as VodafoneTxnType, label: 'سحب من المحفظة', icon: ArrowUpFromLine, gradient: 'from-vodafone to-vodafone-light' },
          { type: 'transfer' as VodafoneTxnType, label: 'تحويل لمحفظة', icon: ArrowLeftRight, gradient: 'from-royal to-royal-light' },
          { type: 'bill_payment' as VodafoneTxnType, label: 'دفع فواتير', icon: Receipt, gradient: 'from-brand-500 to-gold-400' },
        ]).map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSheet(action.type)}
              className="group relative overflow-hidden rounded-2xl glass-card p-6 text-center"
            >
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity', action.gradient)} />
              <motion.div
                whileHover={{ rotate: 12, scale: 1.15 }}
                className={cn('mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', action.gradient)}
              >
                <Icon className="h-7 w-7" />
              </motion.div>
              <p className="font-bold text-sm">{action.label}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Transactions table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle>سجل العمليات</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{filteredTxns.length} عملية</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث برقم الهاتف..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="pr-10 w-48"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-11 rounded-xl border border-input bg-background/50 px-3 text-sm"
            >
              <option value="all">كل الأنواع</option>
              <option value="deposit">إيداع</option>
              <option value="withdraw">سحب</option>
              <option value="transfer">تحويل</option>
              <option value="bill_payment">دفع فواتير</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTxns.length === 0 ? (
            <EmptyState
              icon={<Receipt className="h-8 w-8" />}
              title="لا توجد عمليات"
              description="ابدأ بإجراء عملية إيداع أو سحب لعرض السجل هنا"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-right text-xs text-muted-foreground">
                    <th className="pb-3 font-semibold">رقم العملية</th>
                    <th className="pb-3 font-semibold">النوع</th>
                    <th className="pb-3 font-semibold">العميل</th>
                    <th className="pb-3 font-semibold">الهاتف</th>
                    <th className="pb-3 font-semibold">المبلغ</th>
                    <th className="pb-3 font-semibold">العمولة</th>
                    <th className="pb-3 font-semibold">الموظف</th>
                    <th className="pb-3 font-semibold">الحالة</th>
                    <th className="pb-3 font-semibold">الوقت</th>
                    <th className="pb-3 font-semibold">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredTxns.slice(0, 20).map((txn, i) => {
                      const tc = typeConfig[txn.type];
                      const sc = statusConfig[txn.status];
                      const StatusIcon = sc.icon;
                      const TypeIcon = tc.icon;
                      return (
                        <motion.tr
                          key={txn.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                        >
                          <td className="py-3 text-xs font-mono font-bold">{txn.txn_number}</td>
                          <td className="py-3">
                            <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold bg-gradient-to-r text-white', tc.gradient)}>
                              <TypeIcon className="h-3 w-3" />
                              {tc.label}
                            </span>
                          </td>
                          <td className="py-3 text-sm font-medium">{txn.customer_name || '—'}</td>
                          <td className="py-3 text-sm font-mono">{txn.phone}</td>
                          <td className="py-3 text-sm font-bold">{formatCurrency(txn.amount)}</td>
                          <td className="py-3 text-sm text-muted-foreground">{txn.commission > 0 ? formatCurrency(txn.commission) : '—'}</td>
                          <td className="py-3 text-sm text-muted-foreground">{txn.employee_name?.split(' ')[0] || 'النظام'}</td>
                          <td className="py-3">
                            <Badge variant={sc.variant}>
                              <StatusIcon className="h-3 w-3" />
                              {sc.label}
                            </Badge>
                          </td>
                          <td className="py-3 text-xs text-muted-foreground">{formatTime(txn.created_at)}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="iconSm" onClick={() => { setSelectedTxn(txn); }} title="عرض">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="iconSm" onClick={() => handlePrint(txn)} title="طباعة">
                                <Printer className="h-3.5 w-3.5" />
                              </Button>
                              {txn.status === 'pending' && (
                                <Button variant="ghost" size="iconSm" onClick={() => { cancelTransaction(txn.id); toast.success('تم إلغاء العملية'); }} title="إلغاء" className="text-destructive">
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operation sheets */}
      <DepositSheet open={activeSheet === 'deposit'} onClose={() => setActiveSheet(null)} addTransaction={addTransaction} onPrint={handlePrint} employeeName={user?.full_name || 'النظام'} />
      <WithdrawSheet open={activeSheet === 'withdraw'} onClose={() => setActiveSheet(null)} addTransaction={addTransaction} onPrint={handlePrint} employeeName={user?.full_name || 'النظام'} />
      <TransferSheet open={activeSheet === 'transfer'} onClose={() => setActiveSheet(null)} addTransaction={addTransaction} onPrint={handlePrint} employeeName={user?.full_name || 'النظام'} />
      <BillPaymentSheet open={activeSheet === 'bill_payment'} onClose={() => setActiveSheet(null)} addTransaction={addTransaction} onPrint={handlePrint} employeeName={user?.full_name || 'النظام'} />

      {/* Statement sheet */}
      <Sheet open={activeSheet === 'statement'} onClose={() => setActiveSheet(null)} title="كشف حساب كامل" description="جميع عمليات فودافون كاش" side="right" className="sm:max-w-2xl">
        <StatementContent transactions={transactions} />
      </Sheet>

      {/* Transaction detail */}
      <Sheet open={!!selectedTxn} onClose={() => setSelectedTxn(null)} title="تفاصيل العملية" side="right">
        {selectedTxn && <TxnDetail txn={selectedTxn} onPrint={() => handlePrint(selectedTxn)} />}
      </Sheet>
    </DashboardLayout>
  );
}

// ============ Deposit Sheet ============
type VodafoneSheetProps = {
  open: boolean;
  onClose: () => void;
  addTransaction: (txn: Omit<VodafoneCashTxn, 'id' | 'txn_number' | 'created_at' | 'updated_at'>) => VodafoneCashTxn;
  onPrint: (txn: VodafoneCashTxn) => void;
  employeeName: string;
};

function DepositSheet({ open, onClose, addTransaction, onPrint, employeeName }: VodafoneSheetProps) {
  const [form, setForm] = React.useState({ customerName: '', phone: '', amount: '', fee: '0', notes: '' });
  const [pending, setPending] = React.useState(false);

  const submit = async () => {
    if (!form.phone || !form.amount) { toast.error('أدخل رقم الهاتف والمبلغ'); return; }
    setPending(true);
    await new Promise((r) => setTimeout(r, 800));
    const amount = parseFloat(form.amount);
    const fee = parseFloat(form.fee) || 0;
    const txn = addTransaction({
      type: 'deposit',
      customer_name: form.customerName,
      phone: form.phone,
      amount,
      fee,
      commission: 0,
      net_amount: amount + fee,
      notes: form.notes,
      employee_id: 'current',
      employee_name: employeeName,
      status: 'success',
    });
    setPending(false);
    toast.success('تم الإيداع بنجاح ✅', { description: `رقم العملية: ${txn.txn_number}` });
    onPrint(txn);
    setForm({ customerName: '', phone: '', amount: '', fee: '0', notes: '' });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="إيداع للمحفظة" description="إيداع مبلغ في محفظة فودافون كاش" side="right">
      <div className="space-y-4">
        <Field label="اسم العميل"><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="اسم العميل" /></Field>
        <Field label="رقم الهاتف" required><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" type="tel" /></Field>
        <Field label="المبلغ" required><Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" type="number" /></Field>
        <Field label="رسوم العملية"><Input value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} placeholder="0.00" type="number" /></Field>
        <Field label="ملاحظات"><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات..." /></Field>
        <div className="glass rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">صافي الإيداع</span>
          <span className="text-xl font-black text-gradient-emerald">
            {(parseFloat(form.amount || '0') + parseFloat(form.fee || '0')).toFixed(2)} ج.م
          </span>
        </div>
        <Button variant="emerald" size="lg" className="w-full" onClick={submit} disabled={pending}>
          {pending ? 'جاري المعالجة...' : 'تأكيد الإيداع'}
        </Button>
      </div>
    </Sheet>
  );
}

// ============ Withdraw Sheet ============
function WithdrawSheet({ open, onClose, addTransaction, onPrint, employeeName }: VodafoneSheetProps) {
  const [form, setForm] = React.useState({ customerName: '', phone: '', amount: '', commissionPct: '1.5', notes: '' });
  const [pending, setPending] = React.useState(false);

  const amount = parseFloat(form.amount || '0');
  const commission = amount * (parseFloat(form.commissionPct) / 100);
  const net = amount - commission;

  const submit = async () => {
    if (!form.phone || !form.amount) { toast.error('أدخل رقم الهاتف والمبلغ'); return; }
    setPending(true);
    await new Promise((r) => setTimeout(r, 800));
    const txn = addTransaction({
      type: 'withdraw',
      customer_name: form.customerName,
      phone: form.phone,
      amount,
      fee: 0,
      commission,
      net_amount: net,
      notes: form.notes,
      employee_id: 'current',
      employee_name: employeeName,
      status: 'success',
    });
    setPending(false);
    toast.success('تم السحب بنجاح ✅', { description: `عمولة: ${commission.toFixed(2)} ج.م` });
    onPrint(txn);
    setForm({ customerName: '', phone: '', amount: '', commissionPct: '1.5', notes: '' });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="سحب من المحفظة" description="سحب مبلغ من محفظة فودافون كاش مع احتساب العمولة" side="right">
      <div className="space-y-4">
        <Field label="اسم العميل"><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="اسم العميل" /></Field>
        <Field label="رقم الهاتف" required><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" type="tel" /></Field>
        <Field label="المبلغ" required><Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" type="number" /></Field>
        <Field label="نسبة العمولة %"><Input value={form.commissionPct} onChange={(e) => setForm({ ...form, commissionPct: e.target.value })} placeholder="1.5" type="number" /></Field>
        <Field label="ملاحظات"><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات..." /></Field>
        <div className="glass rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">المبلغ</span><span className="font-bold">{amount.toFixed(2)} ج.م</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">العمولة ({form.commissionPct}%)</span><span className="font-bold text-vodafone">- {commission.toFixed(2)} ج.م</span></div>
          <div className="flex justify-between text-base pt-2 border-t border-border"><span className="font-semibold">صافي المسحوب</span><span className="font-black text-gradient-vodafone">{net.toFixed(2)} ج.م</span></div>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span className="font-bold">الموظف المنفذ:</span> {employeeName}
        </div>
        <Button variant="vodafone" size="lg" className="w-full" onClick={submit} disabled={pending}>
          {pending ? 'جاري المعالجة...' : 'تأكيد السحب'}
        </Button>
      </div>
    </Sheet>
  );
}

// ============ Transfer Sheet ============
function TransferSheet({ open, onClose, addTransaction, onPrint, employeeName }: VodafoneSheetProps) {
  const [form, setForm] = React.useState({ customerName: '', phone: '', destWallet: '', amount: '', notes: '' });
  const [pending, setPending] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  const submit = async () => {
    if (!form.phone || !form.amount || !form.destWallet) { toast.error('أكمل البيانات'); return; }
    if (!confirmed) { setConfirmed(true); toast.info('راجع البيانات واضغط تأكيد مرة أخرى'); return; }
    setPending(true);
    await new Promise((r) => setTimeout(r, 800));
    const amount = parseFloat(form.amount);
    const txn = addTransaction({
      type: 'transfer',
      customer_name: form.customerName,
      phone: form.phone,
      destination_wallet: form.destWallet,
      amount,
      fee: 0,
      commission: 0,
      net_amount: amount,
      notes: form.notes,
      employee_id: 'current',
      employee_name: employeeName,
      status: 'success',
    });
    setPending(false);
    toast.success('تم التحويل بنجاح ✅');
    onPrint(txn);
    setForm({ customerName: '', phone: '', destWallet: '', amount: '', notes: '' });
    setConfirmed(false);
    onClose();
  };

  const cancel = () => { setForm({ customerName: '', phone: '', destWallet: '', amount: '', notes: '' }); setConfirmed(false); onClose(); };

  return (
    <Sheet open={open} onClose={cancel} title="تحويل لمحفظة أخرى" description="تحويل بين المحافظ - يمكن الإلغاء قبل التأكيد" side="right">
      <div className="space-y-4">
        <Field label="اسم العميل"><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="اسم العميل" /></Field>
        <Field label="من محفظة (هاتف)" required><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" type="tel" /></Field>
        <Field label="إلى محفظة (هاتف)" required><Input value={form.destWallet} onChange={(e) => setForm({ ...form, destWallet: e.target.value })} placeholder="01XXXXXXXXX" type="tel" /></Field>
        <Field label="المبلغ" required><Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" type="number" /></Field>
        <Field label="ملاحظات"><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات..." /></Field>
        {confirmed && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-xl p-4 border-2 border-royal/30">
            <p className="text-sm font-bold mb-2">⚠️ مراجعة قبل التأكيد</p>
            <p className="text-xs text-muted-foreground">سيتم تحويل <b>{form.amount} ج.م</b> من <b>{form.phone}</b> إلى <b>{form.destWallet}</b></p>
          </motion.div>
        )}
        <div className="flex gap-2">
          <Button variant="royal" size="lg" className="flex-1" onClick={submit} disabled={pending}>
            {pending ? 'جاري...' : confirmed ? 'تأكيد التحويل نهائياً' : 'متابعة'}
          </Button>
          <Button variant="outline" size="lg" onClick={cancel}>إلغاء</Button>
        </div>
      </div>
    </Sheet>
  );
}

// ============ Bill Payment Sheet ============
function BillPaymentSheet({ open, onClose, addTransaction, onPrint, employeeName }: VodafoneSheetProps) {
  const [form, setForm] = React.useState({ customerName: '', phone: '', billType: 'كهرباء', amount: '', notes: '' });
  const [pending, setPending] = React.useState(false);
  const [qrUrl, setQrUrl] = React.useState('');

  const generateQR = async () => {
    if (!form.amount) { toast.error('أدخل المبلغ أولاً'); return; }
    const url = await import('qrcode').then((m) => m.toDataURL(JSON.stringify({ type: 'bill', bill: form.billType, amount: form.amount, phone: form.phone }), { width: 250, margin: 1 }));
    setQrUrl(url);
    toast.success('تم إنشاء QR للدفع');
  };

  const submit = async () => {
    if (!form.phone || !form.amount) { toast.error('أكمل البيانات'); return; }
    setPending(true);
    await new Promise((r) => setTimeout(r, 800));
    const amount = parseFloat(form.amount);
    const txn = addTransaction({
      type: 'bill_payment',
      customer_name: form.customerName,
      phone: form.phone,
      amount,
      fee: 0,
      commission: 0,
      net_amount: amount,
      notes: `فاتورة ${form.billType} - ${form.notes}`,
      employee_id: 'current',
      employee_name: employeeName,
      status: 'success',
      qr_data: qrUrl,
    });
    setPending(false);
    toast.success('تم دفع الفاتورة بنجاح ✅');
    onPrint(txn);
    setForm({ customerName: '', phone: '', billType: 'كهرباء', amount: '', notes: '' });
    setQrUrl('');
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="دفع الفواتير" description="دفع فواتير المشتريات بفودافون كاش مع QR" side="right">
      <div className="space-y-4">
        <Field label="اسم العميل"><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="اسم العميل" /></Field>
        <Field label="رقم الهاتف" required><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" type="tel" /></Field>
        <Field label="نوع الفاتورة">
          <select value={form.billType} onChange={(e) => setForm({ ...form, billType: e.target.value })} className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 text-sm">
            <option>كهرباء</option><option>غاز</option><option>مياه</option><option>تليفون</option><option>إنترنت</option><option>أخرى</option>
          </select>
        </Field>
        <Field label="المبلغ" required><Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" type="number" /></Field>
        <Field label="ملاحظات"><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="رقم الفاتورة..." /></Field>
        {qrUrl && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center glass rounded-xl p-4">
            <img src={qrUrl} alt="QR" className="h-40 w-40 rounded-lg" />
            <p className="text-xs text-muted-foreground mt-2">امسح للدفع</p>
          </motion.div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={generateQR}><QrCode className="h-4 w-4" />إنشاء QR</Button>
          <Button variant="luxury" onClick={submit} disabled={pending}>{pending ? 'جاري...' : 'تأكيد الدفع'}</Button>
        </div>
      </div>
    </Sheet>
  );
}

// ============ Statement ============
function StatementContent({ transactions }: { transactions: VodafoneCashTxn[] }) {
  const totalDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'success').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = transactions.filter((t) => t.type === 'withdraw' && t.status === 'success').reduce((s, t) => s + t.amount, 0);
  const totalTransfers = transactions.filter((t) => t.type === 'transfer' && t.status === 'success').reduce((s, t) => s + t.amount, 0);
  const totalCommission = transactions.filter((t) => t.type === 'withdraw').reduce((s, t) => s + t.commission, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'إجمالي الإيداعات', value: totalDeposits, color: 'text-emerald2-500' },
          { label: 'إجمالي السحب', value: totalWithdrawals, color: 'text-vodafone' },
          { label: 'إجمالي التحويلات', value: totalTransfers, color: 'text-royal' },
          { label: 'إجمالي العمولات', value: totalCommission, color: 'text-gold-500' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-lg font-black ${s.color}`}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </div>
      <div className="max-h-96 overflow-y-auto no-scrollbar space-y-2">
        {transactions.map((txn) => {
          const tc = typeConfig[txn.type];
          const sc = statusConfig[txn.status];
          return (
            <div key={txn.id} className="flex items-center justify-between glass rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white', tc.gradient)}>
                  <tc.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{tc.label} · {txn.phone}</p>
                  <p className="text-xs text-muted-foreground">{txn.txn_number} · {formatDate(txn.created_at, true)}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold">{formatCurrency(txn.amount)}</p>
                <Badge variant={sc.variant} className="text-[10px]">{sc.label}</Badge>
              </div>
            </div>
          );
        })}
      </div>
      <Button variant="outline" className="w-full" onClick={() => toast.success('تم تصدير الكشف')}>
        <Download className="h-4 w-4" />تصدير الكشف (PDF)
      </Button>
    </div>
  );
}

// ============ Txn Detail ============
function TxnDetail({ txn, onPrint }: { txn: VodafoneCashTxn; onPrint: () => void }) {
  const tc = typeConfig[txn.type];
  const sc = statusConfig[txn.status];
  return (
    <div className="space-y-4">
      <div className={cn('flex items-center gap-3 rounded-2xl bg-gradient-to-br p-4 text-white', tc.gradient)}>
        <tc.icon className="h-8 w-8" />
        <div>
          <p className="font-bold text-lg">{tc.label}</p>
          <p className="text-sm opacity-90">{txn.txn_number}</p>
        </div>
      </div>
      {[
        ['اسم العميل', txn.customer_name || '—'],
        ['رقم الهاتف', txn.phone],
        ['المبلغ', formatCurrency(txn.amount)],
        ['الرسوم', formatCurrency(txn.fee)],
        ['العمولة', formatCurrency(txn.commission)],
        ['الصافي', formatCurrency(txn.net_amount)],
        ['الموظف', txn.employee_name || '—'],
        ['الحالة', sc.label],
        ['التاريخ', formatDate(txn.created_at, true)],
      ].map(([k, v]) => (
        <div key={k} className="flex justify-between glass rounded-lg px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">{k}</span>
          <span className="font-bold">{v}</span>
        </div>
      ))}
      {txn.notes && <div className="glass rounded-lg p-3 text-sm"><p className="text-xs text-muted-foreground mb-1">ملاحظات</p>{txn.notes}</div>}
      <Button variant="luxury" className="w-full" onClick={onPrint}><Printer className="h-4 w-4" />طباعة الإيصال</Button>
    </div>
  );
}

// ============ Helper ============
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">{label}{required && <span className="text-destructive">*</span>}</Label>
      {children}
    </div>
  );
}
