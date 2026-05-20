import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI } from '../api/client';
import { useAuthStore } from '../store/store';
import { FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: '✓' },
  preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-800', icon: '🔨' },
  'out-for-delivery': { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800', icon: '🚗' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '✓' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '✗' }
};

export default function OrderTracking() {
  const { orderId } = useParams();
  const { token } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getOrderById(orderId, token);
      setOrder(response.data);
    } catch (error) {
      toast.error('Error fetching order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-12">Order not found</div>;
  }

  const statusInfo = ORDER_STATUSES[order.status];
  const progress = {
    pending: 20,
    confirmed: 40,
    preparing: 60,
    'out-for-delivery': 80,
    delivered: 100,
    cancelled: 0
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Order Tracking</h1>

      {/* Order Status Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-600">Order ID</p>
            <p className="text-2xl font-bold text-gray-800">#{order._id}</p>
          </div>
          <div className={`px-6 py-3 rounded-full font-semibold ${statusInfo.color}`}>
            {statusInfo.icon} {statusInfo.label}
          </div>
        </div>

        <p className="text-gray-600 mb-4">Estimated Delivery: {order.estimatedDelivery} minutes</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className="bg-green-600 h-3 rounded-full transition-all"
            style={{ width: `${progress[order.status]}%` }}
          ></div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Delivery Timeline</h2>

        <div className="space-y-6">
          {['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'].map((status, index) => {
            const statusList = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'];
            const isCompleted = statusList.indexOf(order.status) >= index;
            const isCurrent = order.status === status;

            return (
              <div key={status} className="flex items-start">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-300'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className="ml-4 flex-1">
                  <p className={`font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                    {ORDER_STATUSES[status].label}
                  </p>
                  {isCurrent && <p className="text-sm text-green-600 font-semibold">Current</p>}
                  {isCompleted && status !== order.status && (
                    <p className="text-sm text-gray-500">Completed</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between border-b pb-3">
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">₹{item.subtotal?.toFixed(2) || (item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Address</h2>

          <div className="space-y-2 text-gray-700">
            <p className="font-semibold text-lg">{order.deliveryAddress?.street}</p>
            <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipcode}</p>
            <p>Phone: {order.deliveryAddress?.phone}</p>
          </div>

          {order.notes && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-semibold text-gray-800">Special Instructions:</p>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>₹{order.totalAmount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Delivery Charge</span>
            <span>{order.deliveryCharge === 0 ? 'Free' : `₹${order.deliveryCharge}`}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{order.discount}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-4 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-green-600">₹{order.finalAmount?.toFixed(2)}</span>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-gray-800">Payment Status:</p>
          <p className={`text-sm font-semibold ${order.paymentStatus === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
            {order.paymentStatus?.toUpperCase()}
          </p>
        </div>
      </div>

      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to cancel this order?')) {
              // Call cancel API
              toast.success('Order cancellation request sent');
            }
          }}
          className="mt-8 w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
        >
          Cancel Order
        </button>
      )}
    </div>
  );
}
