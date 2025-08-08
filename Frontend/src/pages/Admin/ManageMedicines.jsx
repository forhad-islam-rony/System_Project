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
    const [medicines, setMedicines] = useState([]);
    const [loadingMedicines, setLoadingMedicines] = useState(false);
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
            fetchMedicines(); // Refresh the medicine list
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all medicines
    const fetchMedicines = async () => {
        try {
            setLoadingMedicines(true);
            const response = await fetch(`${BASE_URL}/medicines`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch medicines');
            }
            
            const data = await response.json();
            setMedicines(data.data || []);
        } catch (error) {
            console.error('Error fetching medicines:', error);
            toast.error('Failed to fetch medicines');
        } finally {
            setLoadingMedicines(false);
        }
    };

    // Delete medicine
    const deleteMedicine = async (medicineId) => {
        if (!window.confirm('Are you sure you want to delete this medicine?')) {
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/medicines/${medicineId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete medicine');
            }

            toast.success('Medicine deleted successfully');
            fetchMedicines(); // Refresh the list
        } catch (error) {
            console.error('Error deleting medicine:', error);
            toast.error('Failed to delete medicine');
        }
    };

    // Fetch medicines when component mounts
    React.useEffect(() => {
        fetchMedicines();
    }, []);

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
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                                    focus:ring-primaryColor focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    <option value="Antibiotics">Antibiotics</option>
                                    <option value="Cardiac">Cardiac</option>
                                    <option value="Painkillers">Painkillers</option>
                                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                                    <option value="Diabetes">Diabetes</option>
                                    <option value="Respiratory">Respiratory</option>
                                    <option value="Digestive">Digestive</option>
                                </select>
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

            {/* Medicine Management Section */}
            <div className="bg-white rounded-2xl shadow-md p-8">
                <h2 className="text-3xl font-bold text-primaryColor mb-8 border-b pb-4">
                    Manage Existing Medicines
                </h2>
                
                {loadingMedicines ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {medicines.length === 0 ? (
                            <div className="col-span-full text-center py-8">
                                <p className="text-gray-500 text-lg">No medicines found</p>
                            </div>
                        ) : (
                            medicines.map((medicine) => (
                                <div key={medicine._id} className="bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                                    <div className="relative mb-4">
                                        <img
                                            src={medicine.photo}
                                            alt={medicine.productName}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => deleteMedicine(medicine._id)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                                            title="Delete Medicine"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg text-gray-800 truncate">
                                            {medicine.productName}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Generic:</span> {medicine.genericName}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                {medicine.category}
                                            </span>
                                            <span className="font-bold text-green-600">
                                                ৳{medicine.price}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {medicine.dosageMg}mg
                                        </p>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {medicine.description?.text}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageMedicines; 