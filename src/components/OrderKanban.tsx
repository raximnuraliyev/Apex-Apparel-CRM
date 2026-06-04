import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Calendar, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Truck, 
  Plus, 
  X, 
  AlertTriangle,
  Printer,
  CheckCircle2
} from 'lucide-react';
import { Order, OrderStatus, Client, OrderItem } from '../types';

interface OrderKanbanProps {
  orders: Order[];
  clients: Client[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingInfo?: { carrier: string; trackingNum: string }) => void;
  onAddOrder: (newOrder: Omit<Order, '_id' | 'orderNumber' | 'createdAt'>) => void;
}

export default function OrderKanban({ orders, clients, onUpdateOrderStatus, onAddOrder }: OrderKanbanProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [carrierInput, setCarrierInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // New Order Creation Form State
  const [newOrderClientId, setNewOrderClientId] = useState('');
  const [newOrderItems, setNewOrderItems] = useState<OrderItem[]>([{ name: '', qty: 50, price: 20 }]);
  const [newOrderNote, setNewOrderNote] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('Pending');

  const statuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Group orders by status
  const ordersByStatus = statuses.reduce((add, status) => {
    add[status] = orders.filter(o => o.status === status);
    return add;
  }, {} as Record<OrderStatus, Order[]>);

  // Formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    if (nextStatus === 'Shipped') {
      // Must prompt for shipping info or use inputs
      if (selectedOrder && selectedOrder._id === orderId) {
        if (!carrierInput.trim() || !trackingInput.trim()) {
          setErrorMessage('Shipping Carrier and Tracking Number are required to dispatch shipment.');
          return;
        }
        onUpdateOrderStatus(orderId, 'Shipped', {
          carrier: carrierInput,
          trackingNum: trackingInput
        });
        // Sync detail modal
        setSelectedOrder(prev => prev ? { 
          ...prev, 
          status: 'Shipped',
          shippingCarrier: carrierInput,
          trackingNumber: trackingInput
        } : null);
      } else {
        // Direct move fallback
        onUpdateOrderStatus(orderId, 'Shipped', {
          carrier: 'FedEx Standard',
          trackingNum: 'FEX-' + Math.floor(Math.random() * 9000000 + 1000000)
        });
      }
    } else {
      onUpdateOrderStatus(orderId, nextStatus);
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    }
    setErrorMessage('');
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newOrderClientId) {
      setErrorMessage('Please select a wholesale client.');
      return;
    }

    const selectedClient = clients.find(c => c._id === newOrderClientId);
    if (!selectedClient) {
      setErrorMessage('Client not found.');
      return;
    }

    // Validate items
    const validItems = newOrderItems.filter(item => item.name.trim() !== '' && item.qty > 0 && item.price > 0);
    if (validItems.length === 0) {
      setErrorMessage('Please add at least one complete item line.');
      return;
    }

    const totalAmount = validItems.reduce((acc, item) => acc + (item.qty * item.price), 0);

    onAddOrder({
      clientId: selectedClient._id,
      clientName: selectedClient.name,
      companyName: selectedClient.company,
      totalAmount,
      status: newOrderStatus,
      items: validItems,
      note: newOrderNote,
    });

    // Reset Form
    setIsNewOrderOpen(false);
    setNewOrderClientId('');
    setNewOrderItems([{ name: '', qty: 50, price: 20 }]);
    setNewOrderNote('');
    setNewOrderStatus('Pending');
  };

  const handleAddItemLine = () => {
    setNewOrderItems(prev => [...prev, { name: '', qty: 50, price: 20 }]);
  };

  const handleRemoveItemLine = (idx: number) => {
    setNewOrderItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof OrderItem, value: any) => {
    setNewOrderItems(prev => prev.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const statusColors: Record<OrderStatus, { columnBorder: string; badge: string; lightBg: string }> = {
    Pending: {
      columnBorder: 'border-t-amber-500',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      lightBg: 'bg-amber-500/[0.04]'
    },
    Processing: {
      columnBorder: 'border-t-indigo-500',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      lightBg: 'bg-indigo-500/[0.04]'
    },
    Shipped: {
      columnBorder: 'border-t-lime-500',
      badge: 'bg-lime-50 text-lime-700 border-lime-200',
      lightBg: 'bg-lime-500/[0.04]'
    },
    Delivered: {
      columnBorder: 'border-t-emerald-500',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      lightBg: 'bg-emerald-500/[0.04]'
    },
    Cancelled: {
      columnBorder: 'border-t-slate-400',
      badge: 'bg-slate-100 text-slate-700 border-slate-300',
      lightBg: 'bg-slate-500/[0.03]'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#6366F1] uppercase block mb-1 font-semibold">
            DISTRIBUTION CENTER
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Order Board (Kanban Queue)
          </h1>
          <p className="text-sm font-light text-slate-500 mt-0.5">
            Transition allocations fluidly from Pending status down to dispatched Shipped carrier records.
          </p>
        </div>

        <button
          id="kanban-add-order-trigger-button"
          onClick={() => {
            const defaultClient = clients.find(c => c.status === 'Active');
            if (defaultClient) setNewOrderClientId(defaultClient._id);
            setErrorMessage('');
            setIsNewOrderOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-150 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Wholesale Order
        </button>
      </div>

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        {statuses.map((status) => {
          const colOrders = ordersByStatus[status] || [];
          const colStyles = statusColors[status];
          
          return (
            <div 
              key={status} 
              className={`bg-white/80 backdrop-blur-md rounded-2xl border border-slate-205 shadow-xs flex flex-col max-h-[750px] min-h-[380px] border-t-4 ${colStyles.columnBorder}`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/55 rounded-t-xl shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 font-sans">
                    {status}
                  </span>
                  <span className="text-xs bg-slate-150 text-slate-700 font-mono px-2 py-0.5 rounded-full font-bold">
                    {colOrders.length}
                  </span>
                </div>
                
                <span className="text-[10px] font-mono tracking-wider text-slate-400 font-bold">
                  STAGE
                </span>
              </div>

              {/* Column Cards Container - Scrollable */}
              <div className={`p-3 flex-1 overflow-y-auto space-y-3 ${colStyles.lightBg}`}>
                {colOrders.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-4 text-center select-none bg-white/20">
                    <span className="text-xs text-slate-400 font-semibold font-sans">Queue is currently clear</span>
                  </div>
                ) : (
                  colOrders.map((ord) => {
                    const displayDate = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-CA') : '';
                    return (
                      <motion.div
                        id={`order-card-${ord._id}`}
                        key={ord._id}
                        layoutId={`order-card-${ord._id}`}
                        whileHover={{ y: -3, boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.05)' }}
                        onClick={() => {
                          setCarrierInput(ord.shippingCarrier || '');
                          setTrackingInput(ord.trackingNumber || '');
                          setErrorMessage('');
                          setSelectedOrder(ord);
                        }}
                        className="bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-slate-200/80 hover:border-indigo-200 cursor-pointer transition-all shadow-xs flex flex-col justify-between hover:bg-white"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold text-slate-900 px-2 py-1 bg-slate-100 rounded-md border border-slate-150">
                              {ord.orderNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              {displayDate}
                            </span>
                          </div>

                          <span className="text-sm font-bold text-slate-900 block font-sans tracking-tight leading-tight">
                            {ord.companyName}
                          </span>
                          
                          {/* Mini visual list wrapper */}
                          <div className="mt-2 space-y-1">
                            {ord.items.slice(0, 2).map((item, i) => (
                              <div key={i} className="text-xs text-slate-500 font-normal flex items-center justify-between">
                                <span className="truncate max-w-[100px]">{item.name}</span>
                                <span className="font-mono text-slate-400 shrink-0">x{item.qty}</span>
                              </div>
                            ))}
                            {ord.items.length > 2 && (
                              <span className="text-[10px] text-indigo-600 font-mono block pt-0.5 font-bold">
                                + {ord.items.length - 2} more items
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card bottom info */}
                        <div className="mt-3 pt-3 border-t border-slate-150 flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">
                            {formatCurrency(ord.totalAmount)}
                          </span>

                          {/* Quick navigation arrows */}
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {status !== 'Pending' && status !== 'Delivered' && (
                              <button
                                title="Move status back"
                                onClick={() => {
                                  const prevStatuses: Record<OrderStatus, OrderStatus> = {
                                    Pending: 'Pending',
                                    Processing: 'Pending',
                                    Shipped: 'Processing',
                                    Delivered: 'Shipped',
                                    Cancelled: 'Processing'
                                  };
                                  handleUpdateStatus(ord._id, prevStatuses[status]);
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-650 hover:bg-slate-100 rounded-md transition-all shrink-0 cursor-pointer border border-transparent hover:border-slate-205"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {status !== 'Shipped' && status !== 'Delivered' && status !== 'Cancelled' && (
                              <button
                                title="Advance status"
                                onClick={() => {
                                  const nextStatuses: Record<OrderStatus, OrderStatus> = {
                                    Pending: 'Processing',
                                    Processing: 'Shipped',
                                    Shipped: 'Delivered',
                                    Delivered: 'Delivered',
                                    Cancelled: 'Cancelled'
                                  };
                                  handleUpdateStatus(ord._id, nextStatuses[status]);
                                }}
                                className="p-1 px-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition-all shrink-0 font-mono text-[10px] font-bold flex items-center gap-0.5 cursor-pointer border border-indigo-150"
                              >
                                Adv.
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}

                            {status === 'Shipped' && (
                              <button
                                title="Mark as Delivered"
                                onClick={() => handleUpdateStatus(ord._id, 'Delivered')}
                                className="p-1 px-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-all shrink-0 font-mono text-[10px] font-bold flex items-center gap-0.5 cursor-pointer border border-emerald-150"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Dlvr.
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over/Modal Right to Review Order Details & Update Shipping */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedOrder(null);
                setErrorMessage('');
              }}
              className="fixed inset-0 bg-slate-900/15 backdrop-blur-xs z-40 cursor-pointer"
            />

            {/* Slide over detail layout */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white/95 backdrop-blur-xl border-l border-slate-200 shadow-2xl z-50 flex flex-col justify-between overflow-hidden"
            >
              {/* Drawer Top Header */}
              <div className="p-6 bg-white/60 border-b border-slate-150 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-700 flex items-center justify-center rounded-lg border border-indigo-100">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-950 font-sans tracking-tight">
                        {selectedOrder.orderNumber}
                      </span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-md font-bold border ${statusColors[selectedOrder.status]?.badge || ''}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block font-light mt-0.5">
                      Batch recorded on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('en-CA') : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    title="Print Allocation Pack List"
                    onClick={() => window.print()}
                    className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-all shrink-0"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrder(null);
                      setErrorMessage('');
                    }}
                    className="p-1 px-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-all shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                
                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-start gap-2.5">
                    <AlertTriangle className="h-4.5 w-4.5 mt-0.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Wholesaler Details Card */}
                <div className="bg-white p-4.5 rounded-xl border border-gray-100 space-y-3 shadow-xs">
                  <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider block font-bold">
                    Wholesaler Profile
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-950">{selectedOrder.companyName}</h4>
                    <p className="text-xs text-gray-500 font-light flex items-center gap-1.5 mt-1">
                      <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      Contact Rep: {selectedOrder.clientName} (Buyer-ID: {selectedOrder.clientId})
                    </p>
                  </div>
                </div>

                {/* Products Allocated List */}
                <div className="space-y-3 bg-white p-4.5 rounded-xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider font-bold">
                      Allocated Apparel lines
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      {selectedOrder.items.length} unique line items
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100 space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between pt-2 text-xs">
                        <div>
                          <span className="font-semibold text-gray-900 block">
                            {item.name}
                          </span>
                          <span className="text-gray-400 font-mono text-[10px] block mt-0.5">
                            Unit Price: {formatCurrency(item.price)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-gray-600 font-bold block">
                            x{item.qty}
                          </span>
                          <span className="font-bold text-gray-900 block mt-0.5">
                            {formatCurrency(item.qty * item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between font-sans">
                    <span className="text-xs font-semibold text-gray-500">Total Contract Value</span>
                    <span className="text-base font-bold text-indigo-600">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Status timelines controller */}
                <div className="bg-white p-4.5 rounded-xl border border-gray-100 shadow-xs space-y-4">
                  <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider block font-bold leading-none">
                    Status Controller
                  </span>

                  <div className="grid grid-cols-2 gap-3.5">
                    {[
                      { st: 'Pending' as const, lbl: 'Move to Pending' },
                      { st: 'Processing' as const, lbl: 'Confirm Processing' },
                      { st: 'Shipped' as const, lbl: 'Ship (With Carrier)' },
                      { st: 'Delivered' as const, lbl: 'Mark Delivered' },
                      { st: 'Cancelled' as const, lbl: 'Cancel Allocation' }
                    ].map((btn) => (
                      <button
                        key={btn.st}
                        id={`status-ctrl-btn-${btn.st}`}
                        onClick={() => handleUpdateStatus(selectedOrder._id, btn.st)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                          selectedOrder.status === btn.st 
                            ? 'bg-indigo-600 text-white border-indigo-700' 
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {btn.lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Courier details conditional entry */}
                <AnimatePresence>
                  {(selectedOrder.status === 'Shipped' || selectedOrder.status === 'Processing') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-indigo-50/50 border border-indigo-100 p-4.5 rounded-xl space-y-4 overflow-hidden"
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                        <span className="text-xs font-mono uppercase text-indigo-950 font-bold">
                          Shipping Logistics Records
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1.5">
                            Shipping Carrier / Mode
                          </label>
                          <input
                            id="courier-carrier-input"
                            type="text"
                            placeholder="e.g. FedEx Freight, DHL Express, UPS Ground"
                            value={carrierInput}
                            onChange={(e) => setCarrierInput(e.target.value)}
                            disabled={selectedOrder.status === 'Shipped' && !!selectedOrder.shippingCarrier}
                            className="w-full px-3 py-2 bg-white border border-indigo-200 focus:border-indigo-500 rounded-lg text-xs outline-none text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1.5">
                            Airbill / Tracking Number
                          </label>
                          <input
                            id="courier-tracking-input"
                            type="text"
                            placeholder="Tracking code e.g. 1Z999XX10"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            disabled={selectedOrder.status === 'Shipped' && !!selectedOrder.trackingNumber}
                            className="w-full px-3 py-2 bg-white border border-indigo-200 focus:border-indigo-500 rounded-lg text-xs outline-none text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>

                        {selectedOrder.status === 'Processing' && (
                          <button
                            id="confirm-dispatch-logistics-button"
                            type="button"
                            onClick={() => handleUpdateStatus(selectedOrder._id, 'Shipped')}
                            className="w-full py-2 bg-[#6366F1] hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all cursor-pointer"
                          >
                            Mark Dispatched (Submit Shipping airbill)
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Warehouse notes block */}
                {selectedOrder.note && (
                  <div className="p-3.5 bg-gray-150 border border-gray-200 rounded-xl space-y-1.5 bg-gray-50">
                    <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider block font-bold">
                      Distribution Note
                    </span>
                    <p className="text-xs text-gray-600 font-light leading-relaxed">
                      {selectedOrder.note}
                    </p>
                  </div>
                )}

              </div>

              {/* Drawer footer close */}
              <div className="p-6 bg-white/50 border-t border-slate-150 flex justify-end shrink-0">
                <button
                  id="close-order-drawer-footer-button"
                  onClick={() => {
                    setSelectedOrder(null);
                    setErrorMessage('');
                  }}
                  className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Close Bill View
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slide-over Drawer for creating dynamic new orders */}
      <AnimatePresence>
        {isNewOrderOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewOrderOpen(false)}
              className="fixed inset-0 bg-slate-900/15 backdrop-blur-xs z-40 cursor-pointer"
            />

            {/* Slide over */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white/95 backdrop-blur-xl border-l border-slate-200 shadow-2xl z-50 flex flex-col justify-between overflow-hidden"
            >
              {/* Drawer header */}
              <div className="p-6 bg-white/60 border-b border-slate-150 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 bg-indigo-50 text-indigo-700 flex items-center justify-center rounded-lg border border-indigo-100">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-md font-bold text-slate-900">Create Wholesale Allocation</h2>
                    <p className="text-[10px] font-mono tracking-widest text-indigo-650 uppercase font-bold">APEX LOGISTICS WAREHOUSE</p>
                  </div>
                </div>
                <button
                  id="close-new-order-drawer-button"
                  onClick={() => setIsNewOrderOpen(false)}
                  className="p-1 px-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-all shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer core form - Scrollable */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <form id="new-wholesale-order-form" onSubmit={handleCreateOrder} className="space-y-5">
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Wholesaler selector */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                      Select Wholesaler Partner Accounts
                    </label>
                    <select
                      id="new-order-client-select"
                      required
                      value={newOrderClientId}
                      onChange={(e) => setNewOrderClientId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-lg text-sm text-gray-900 outline-none transition-all"
                    >
                      <option value="">-- Choose active wholesalers buyer team --</option>
                      {clients.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.company} ({c.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Allocate items array lines */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono uppercase tracking-wider text-gray-500">
                        Product Item Lines
                      </label>
                      <button
                        id="add-item-line-button"
                        type="button"
                        onClick={handleAddItemLine}
                        className="text-xs text-indigo-600 hover:underline flex items-center font-semibold gap-1 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Add Product Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {newOrderItems.map((item, index) => (
                        <div key={index} className="p-4 bg-white border border-gray-100 rounded-xl space-y-3 relative shadow-xs">
                          {newOrderItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItemLine(index)}
                              className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md cursor-pointer transition-all"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <div>
                            <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Product Description</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Premium Heavyweight Fleece Hoodies (Pecan)"
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-lg text-xs outline-none text-gray-900 transition-all font-sans"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Contract Quantity</label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={item.qty}
                                onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-lg text-xs outline-none text-gray-900 transition-all font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Unit Price ($ Wholesale)</label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={item.price}
                                onChange={(e) => handleItemChange(index, 'price', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-lg text-xs outline-none text-gray-900 transition-all font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                      Queue Order Status
                    </label>
                    <select
                      id="new-order-status-select"
                      value={newOrderStatus}
                      onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-lg text-sm text-gray-900 outline-none transition-all animate-none"
                    >
                      <option value="Pending">Pending (Newly Registered)</option>
                      <option value="Processing">Processing (Prepared at Warehouse)</option>
                    </select>
                  </div>

                  {/* Distribution note text */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                      Distribution / Shipping Instruction Note
                    </label>
                    <textarea
                      id="new-order-note-textarea"
                      rows={3}
                      placeholder="e.g. Expedite sorting at LA hub or request heavy-pallet shipping crates."
                      value={newOrderNote}
                      onChange={(e) => setNewOrderNote(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-indigo-500 rounded-lg text-xs outline-none text-gray-900 transition-all"
                    />
                  </div>

                  <input type="submit" className="hidden" />
                </form>
              </div>

              {/* Drawer action footer */}
              <div className="p-6 bg-white/50 border-t border-slate-150 flex items-center justify-end gap-3 shrink-0">
                <button
                  id="new-order-drawer-cancel-button"
                  type="button"
                  onClick={() => setIsNewOrderOpen(false)}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold transition-all border border-slate-200 cursor-pointer animate-none"
                >
                  Cancel
                </button>
                <button
                  id="new-order-drawer-submit-button"
                  type="button"
                  onClick={handleCreateOrder}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-100 cursor-pointer animate-none"
                >
                  Commit Allocation Order
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
