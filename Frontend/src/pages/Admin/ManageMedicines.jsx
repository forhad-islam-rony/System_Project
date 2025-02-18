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
        <div className="max-w-[1170px] mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-8 mb-10">
                <h2 className="text-3xl font-bold text-primaryColor mb-8 border-b pb-4">
                    Add New Medicine
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Image Upload Section */}
                    <div className="bg-[#F8F9FA] p-6 rounded-xl">
                        <label className="block text-lg font-semibold text-gray-800 mb-4">
                            Medicine Image
                        </label>
                        <div className="flex items-center gap-6">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    name="photo"
                                    id="photo"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={handleFileInputChange}
                                    className="file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 
                                    file:text-sm file:font-semibold file:bg-primaryColor file:text-white 
                                    hover:file:bg-primaryDark transition-all w-full
                                    text-gray-600 rounded-lg border border-gray-300"
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    Supported formats: JPG, JPEG, PNG
                                </p>
                            </div>
                            {previewURL && (
                                <div className="relative w-40 h-40">
                                    <img
                                        src={previewURL}
                                        alt="preview"
                                        className="w-full h-full object-cover rounded-xl shadow-md"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Information Section */}
                    <div className="bg-[#F8F9FA] p-6 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                                    focus:ring-primaryColor focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Generic Name
                                </label>
                                <input
                                    type="text"
                                    name="genericName"
                                    value={formData.genericName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                                    focus:ring-primaryColor focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                                    focus:ring-primaryColor focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                                    focus:ring-primaryColor focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dosage (mg)
                                </label>
                                <input
                                    type="number"
                                    name="dosageMg"
                                    value={formData.dosageMg}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                                    focus:ring-primaryColor focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="bg-[#F8F9FA] p-6 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Detailed Information
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description.text"
                                    value={formData.description.text}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                                    focus:ring-primaryColor focus:border-transparent transition-all"
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Key Benefits
                                </label>
                                <textarea
                                    name="description.keyBenefits"
                                    value={formData.description.keyBenefits}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                                    focus:ring-primaryColor focus:border-transparent transition-all"
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recommended For
                                </label>
                                <textarea
                                    name="description.recommendedFor"
                                    value={formData.description.recommendedFor}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                                    focus:ring-primaryColor focus:border-transparent transition-all"
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Usage Instructions
                                </label>
                                <textarea
                                    name="usageInstruction"
                                    value={formData.usageInstruction}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                                    focus:ring-primaryColor focus:border-transparent transition-all"
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Side Effects
                                </label>
                                <textarea
                                    name="sideEffects"
                                    value={formData.sideEffects}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                                    focus:ring-primaryColor focus:border-transparent transition-all"
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Storage Instructions
                                </label>
                                <textarea
                                    name="storage"
                                    value={formData.storage}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                                    focus:ring-primaryColor focus:border-transparent transition-all"
                                    required
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-primaryColor text-white px-8 py-3 rounded-lg 
                            hover:bg-primaryDark transition-all duration-300 font-semibold
                            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Adding Medicine...
                                </span>
                            ) : (
                                'Add Medicine'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManageMedicines; 