import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { toast } from 'react-hot-toast';
import HashLoader from 'react-spinners/HashLoader';
import { useAuth } from '../../context/AuthContext';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${BASE_URL}/orders/all`, {
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

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            // Update orders list
            setOrders(orders.map(order => 
                order._id === orderId ? result.data : order
            ));
            toast.success('Order status updated successfully');
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <HashLoader color="#3498db" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
            
            <div className="grid grid-cols-1 gap-6">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Order #{order._id.slice(-6)}
                                </h2>
                                <p className="text-gray-600">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                                <select
                                    className="border rounded px-2 py-1"
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Customer Details</h3>
                            <p>Name: {order.user.name}</p>
                            <p>Email: {order.user.email}</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Shipping Address</h3>
                            <p>{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                            <p>Phone: {order.shippingAddress.phone}</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Order Items</h3>
                            <div className="space-y-2">
                                {order.items.map((item) => (
                                    <div key={item._id} className="flex items-center gap-4">
                                        {item.medicine ? (
                                            <img
                                                src={item.medicine.photo || '/placeholder-medicine.png'}
                                                alt={item.medicine.productName || 'Medicine'}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                <span className="text-gray-500 text-xs">No image</span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium">
                                                {item.medicine ? item.medicine.productName : 'Product no longer available'}
                                            </p>
                                            <p className="text-gray-600">
                                                {item.quantity || 0} x ৳{(item.price || 0).toFixed(2)} = ৳{((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between">
                                <span className="font-semibold">Total Amount:</span>
                                <span className="font-bold">৳{(order.totalAmount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageOrders; 