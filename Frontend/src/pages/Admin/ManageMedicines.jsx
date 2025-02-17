import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import uploadImageToCloudinary from '../../utils/uploadCloudinary';

const ManageMedicines = () => {
    const { token } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewURL, setPreviewURL] = useState('');
    const [formData, setFormData] = useState({
        productName: '',
        genericName: '',
        category: '',
        price: '',
        dosageMg: '',
        photo: '',
        description: {
            text: '',
            keyBenefits: '',
            recommendedFor: ''
        },
        usageInstruction: '',
        sideEffects: '',
        storage: ''
    });

    const handleFileInputChange = async (event) => {
        const file = event.target.files[0];
        
        // Preview
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setPreviewURL(reader.result);
        };
        
        setSelectedFile(file);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            toast.error('Please select an image');
            return;
        }

        try {
            setLoading(true);

            // Upload image to Cloudinary
            const uploadResult = await uploadImageToCloudinary(selectedFile);
            
            // Add the photo URL to formData
            const updatedFormData = {
                ...formData,
                photo: uploadResult.url
            };

            // Send data to backend
            const res = await fetch(`${BASE_URL}/medicines`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedFormData)
            });

            const { message, success } = await res.json();

            if (!res.ok) {
                throw new Error(message || 'Something went wrong');
            }

            // Reset form after successful submission
            setFormData({
                productName: '',
                genericName: '',
                category: '',
                price: '',
                dosageMg: '',
                photo: '',
                description: {
                    text: '',
                    keyBenefits: '',
                    recommendedFor: ''
                },
                usageInstruction: '',
                sideEffects: '',
                storage: ''
            });
            setSelectedFile(null);
            setPreviewURL('');

            toast.success('Medicine added successfully!');
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-primaryColor mb-6">Add New Medicine</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700">Medicine Image</label>
                    <div className="mt-2 flex items-center gap-4">
                        <input
                            type="file"
                            name="photo"
                            id="photo"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleFileInputChange}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primaryColor file:text-white hover:file:bg-primaryDark"
                        />
                        {previewURL && (
                            <img
                                src={previewURL}
                                alt="preview"
                                className="w-32 h-32 object-cover rounded-lg"
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input
                            type="text"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Generic Name</label>
                        <input
                            type="text"
                            name="genericName"
                            value={formData.genericName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dosage (mg)</label>
                        <input
                            type="number"
                            name="dosageMg"
                            value={formData.dosageMg}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description.text"
                            value={formData.description.text}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Key Benefits</label>
                        <textarea
                            name="description.keyBenefits"
                            value={formData.description.keyBenefits}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Recommended For</label>
                        <textarea
                            name="description.recommendedFor"
                            value={formData.description.recommendedFor}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Usage Instructions</label>
                        <textarea
                            name="usageInstruction"
                            value={formData.usageInstruction}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Side Effects</label>
                        <textarea
                            name="sideEffects"
                            value={formData.sideEffects}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Storage Instructions</label>
                        <textarea
                            name="storage"
                            value={formData.storage}
                            onChange={handleChange}
                            rows="2"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            required
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-primaryColor text-white px-6 py-2 rounded-md hover:bg-primaryDark transition-colors ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Adding...' : 'Add Medicine'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManageMedicines; 