import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';

const AddressModal = ({ isOpen, onClose, onSubmit }) => {
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        phone: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(address);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-8 z-50 w-96">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Shipping Address</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <IoMdClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Street Address</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={address.street}
                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={address.zipCode}
                            onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={address.phone}
                            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Confirm Order
                    </button>
                </form>
            </div>
        </>
    );
};

export default AddressModal; 