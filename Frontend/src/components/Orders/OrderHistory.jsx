import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import HashLoader from 'react-spinners/HashLoader';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${BASE_URL}/orders/user-orders`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            setOrders(result.data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <HashLoader color="#3498db" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Order History</h2>
            
            {orders.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No orders found</p>
                </div>
            ) : (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Order #{order._id.slice(-6)}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item._id} className="flex items-center gap-4 border-b pb-4">
                                        <img
                                            src={item.medicine?.photo || '/placeholder-medicine.png'}
                                            alt={item.medicine?.productName || 'Medicine'}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium">{item.medicine?.productName || 'Unknown Product'}</h4>
                                            <p className="text-gray-600">
                                                {item.quantity} x ${item.price} = ${item.quantity * item.price}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold">Shipping Address:</h4>
                                        <p className="text-gray-600">
                                            {order.shippingAddress.street},<br />
                                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                            Phone: {order.shippingAddress.phone}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-gray-600">Total Amount:</span>
                                        <p className="text-xl font-bold">${order.totalAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory; 