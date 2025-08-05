import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUploader = ({ onFileUpload, uploading = false, sessionId }) => {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'File rejected';
      
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        errorMessage = 'File is too large. Maximum size is 15MB.';
      } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        errorMessage = 'Invalid file type. Supported: PDF, Word documents, text files, and images (JPG, PNG, GIF, BMP, TIFF, WebP).';
      }
      
      setUploadStatus({ type: 'error', message: errorMessage });
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    if (!sessionId) {
      setUploadStatus({ type: 'error', message: 'No active chat session. Please start a new conversation.' });
      return;
    }

    try {
      setUploadStatus({ type: 'uploading', message: 'Uploading and analyzing your report...' });
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onFileUpload(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus({ type: 'success', message: 'Report uploaded and analyzed successfully!' });
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
        setUploadProgress(0);
      }, 3000);

    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: error.message || 'Failed to upload and analyze report' 
      });
      setUploadProgress(0);
    }
  }, [onFileUpload, sessionId]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf'],
      'text/rtf': ['.rtf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tiff', '.tif'],
      'image/webp': ['.webp']
    },
    maxSize: 15 * 1024 * 1024, // 15MB
    maxFiles: 1,
    disabled: uploading || !sessionId
  });

  const getDropzoneClassName = () => {
    let className = 'dropzone';
    if (isDragActive) className += ' active';
    if (isDragAccept) className += ' accept';
    if (isDragReject) className += ' reject';
    if (uploading || !sessionId) className += ' disabled';
    return className;
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'uploading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '';
    }
  };

  return (
    <div className="file-uploader">
      <div {...getRootProps({ className: getDropzoneClassName() })}>
        <input {...getInputProps()} />
        
        <div className="dropzone-content">
          {uploading || uploadStatus?.type === 'uploading' ? (
            <div className="upload-progress">
              <div className="progress-icon">📄</div>
              <div className="progress-text">
                <div>Processing your medical report...</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="progress-percentage">{uploadProgress}%</div>
              </div>
            </div>
          ) : (
            <>
              <div className="dropzone-icon">
                {isDragActive ? '📁' : '📄📷'}
              </div>
              <div className="dropzone-text">
                <div className="primary-text">
                  {isDragActive
                    ? 'Drop your medical document/image here'
                    : 'Upload Medical Document'
                  }
                </div>
                <div className="secondary-text">
                  {!sessionId ? (
                    'Start a conversation first to upload reports'
                  ) : (
                    'Drag & drop or click to select documents or images'
                  )}
                </div>
                <div className="file-info">
                  📋 PDF, Word, Images (JPG, PNG, TIFF, etc.) • Max: 15MB
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.type}`}>
          <span className="status-icon">
            {getStatusIcon(uploadStatus.type)}
          </span>
          <span className="status-message">
            {uploadStatus.message}
          </span>
        </div>
      )}

      <div className="upload-tips">
        <h4>💡 Tips for better analysis:</h4>
        <ul>
          <li>Upload clear, readable medical reports</li>
          <li>Include lab results, diagnostic reports, or prescriptions</li>
          <li>Ensure all text is visible and not cut off</li>
          <li>Multiple reports? Upload them one by one</li>
        </ul>
      </div>

      <style jsx>{`
        .file-uploader {
          margin-bottom: 20px;
        }

        .dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8fafc;
        }

        .dropzone:hover:not(.disabled) {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .dropzone.active {
          border-color: #3b82f6;
          background: #eff6ff;
          transform: scale(1.02);
        }

        .dropzone.accept {
          border-color: #10b981;
          background: #ecfdf5;
        }

        .dropzone.reject {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .dropzone.disabled {
          background: #f1f5f9;
          border-color: #e2e8f0;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .dropzone-icon {
          font-size: 3rem;
          opacity: 0.7;
        }

        .dropzone-text {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .primary-text {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .secondary-text {
          color: #64748b;
          font-size: 0.875rem;
        }

        .file-info {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 8px;
        }

        .upload-progress {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .progress-icon {
          font-size: 2rem;
        }

        .progress-text {
          flex: 1;
          text-align: left;
        }

        .progress-bar {
          width: 200px;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin: 8px 0;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          transition: width 0.3s ease;
        }

        .progress-percentage {
          font-size: 0.875rem;
          color: #64748b;
        }

        .upload-status {
          margin-top: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
        }

        .upload-status.success {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .upload-status.error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .upload-status.uploading {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }

        .status-icon {
          font-size: 1rem;
        }

        .status-message {
          flex: 1;
        }

        .upload-tips {
          margin-top: 16px;
          padding: 16px;
          background: #f1f5f9;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .upload-tips h4 {
          margin: 0 0 12px 0;
          color: #1e293b;
          font-size: 0.875rem;
        }

        .upload-tips ul {
          margin: 0;
          padding-left: 20px;
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.5;
        }

        .upload-tips li {
          margin-bottom: 4px;
        }

        @media (max-width: 768px) {
          .dropzone {
            padding: 24px 16px;
          }

          .dropzone-icon {
            font-size: 2rem;
          }

          .primary-text {
            font-size: 1rem;
          }

          .progress-bar {
            width: 150px;
          }

          .upload-progress {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default FileUploader;
