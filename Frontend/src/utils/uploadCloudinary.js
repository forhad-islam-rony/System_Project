const uploadImageToCloudinary = async file => {
  const upload_preset = import.meta.env.VITE_UPLOAD_PRESET;
  const cloud_name = import.meta.env.VITE_CLOUD_NAME;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', upload_preset);
    formData.append('cloud_name', cloud_name);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      {
        method: 'post',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    const data = await response.json();
    
    if (!data.url) {
      throw new Error('No URL in upload response');
    }

    return { url: data.url };
  } catch (error) {
    console.error('Error uploading to cloudinary:', error);
    throw error;
  }
};

export default uploadImageToCloudinary;