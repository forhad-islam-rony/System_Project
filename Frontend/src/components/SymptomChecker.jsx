import React, { useState } from 'react';

const SymptomChecker = ({ onSymptomCheck, loading = false }) => {
  const [symptoms, setSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [showQuickSymptoms, setShowQuickSymptoms] = useState(false);

  const commonSymptoms = [
    { id: 'fever', label: 'Fever', icon: '🌡️' },
    { id: 'headache', label: 'Headache', icon: '🤕' },
    { id: 'cough', label: 'Cough', icon: '😷' },
    { id: 'fatigue', label: 'Fatigue', icon: '😴' },
    { id: 'nausea', label: 'Nausea', icon: '🤢' },
    { id: 'dizziness', label: 'Dizziness', icon: '😵' },
    { id: 'chest_pain', label: 'Chest Pain', icon: '💔' },
    { id: 'shortness_breath', label: 'Shortness of Breath', icon: '🫁' },
    { id: 'abdominal_pain', label: 'Abdominal Pain', icon: '🤰' },
    { id: 'joint_pain', label: 'Joint Pain', icon: '🦴' },
    { id: 'rash', label: 'Skin Rash', icon: '🔴' },
    { id: 'sore_throat', label: 'Sore Throat', icon: '🗣️' }
  ];

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev => {
      const isSelected = prev.find(s => s.id === symptom.id);
      if (isSelected) {
        return prev.filter(s => s.id !== symptom.id);
      } else {
        return [...prev, symptom];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let symptomText = symptoms.trim();
    
    if (selectedSymptoms.length > 0) {
      const selectedText = selectedSymptoms.map(s => s.label).join(', ');
      symptomText = symptomText ? `${symptomText}. Also experiencing: ${selectedText}` : selectedText;
    }
    
    if (symptomText && onSymptomCheck) {
      onSymptomCheck(symptomText);
      setSymptoms('');
      setSelectedSymptoms([]);
      setShowQuickSymptoms(false);
    }
  };

  const getSeverityColor = (symptom) => {
    const highPriority = ['chest_pain', 'shortness_breath', 'severe_headache'];
    const mediumPriority = ['fever', 'abdominal_pain', 'dizziness'];
    
    if (highPriority.includes(symptom.id)) {
      return '#ef4444'; // Red
    } else if (mediumPriority.includes(symptom.id)) {
      return '#f59e0b'; // Orange
    } else {
      return '#3b82f6'; // Blue
    }
  };

  return (
    <div className="symptom-checker">
      <div className="symptom-checker-header">
        <h3>🩺 Symptom Checker</h3>
        <p>Describe your symptoms for a quick health assessment</p>
      </div>

      <form onSubmit={handleSubmit} className="symptom-form">
        <div className="symptom-input-section">
          <label htmlFor="symptoms">Describe your symptoms:</label>
          <textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Example: I have a headache that started this morning, along with some nausea and sensitivity to light..."
            rows="4"
            className="symptom-textarea"
            disabled={loading}
          />
        </div>

        <div className="quick-symptoms-section">
          <div className="quick-symptoms-header">
            <span>Or select common symptoms:</span>
            <button
              type="button"
              className="toggle-quick-symptoms"
              onClick={() => setShowQuickSymptoms(!showQuickSymptoms)}
            >
              {showQuickSymptoms ? '▼ Hide' : '▶ Show'} Quick Select
            </button>
          </div>

          {showQuickSymptoms && (
            <div className="quick-symptoms-grid">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom.id}
                  type="button"
                  className={`symptom-button ${
                    selectedSymptoms.find(s => s.id === symptom.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleSymptomToggle(symptom)}
                  style={{
                    borderColor: selectedSymptoms.find(s => s.id === symptom.id) 
                      ? getSeverityColor(symptom) 
                      : '#e2e8f0'
                  }}
                >
                  <span className="symptom-icon">{symptom.icon}</span>
                  <span className="symptom-label">{symptom.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedSymptoms.length > 0 && (
          <div className="selected-symptoms">
            <span className="selected-label">Selected symptoms:</span>
            <div className="selected-symptoms-list">
              {selectedSymptoms.map((symptom) => (
                <span key={symptom.id} className="selected-symptom-tag">
                  {symptom.icon} {symptom.label}
                  <button
                    type="button"
                    className="remove-symptom"
                    onClick={() => handleSymptomToggle(symptom)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="submit-section">
          <button
            type="submit"
            className="check-symptoms-button"
            disabled={(!symptoms.trim() && selectedSymptoms.length === 0) || loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Analyzing Symptoms...
              </>
            ) : (
              <>
                🔍 Check Symptoms
              </>
            )}
          </button>
        </div>
      </form>

      <div className="disclaimer">
        <div className="disclaimer-icon">⚠️</div>
        <div className="disclaimer-text">
          <strong>Important:</strong> This is not a medical diagnosis. Always consult with a healthcare professional for proper medical advice, especially for severe or persistent symptoms.
        </div>
      </div>

      <div className="emergency-info">
        <div className="emergency-header">🚨 Emergency Symptoms</div>
        <div className="emergency-list">
          Call <strong>999</strong> immediately if experiencing:
          <ul>
            <li>Severe chest pain or pressure</li>
            <li>Difficulty breathing or choking</li>
            <li>Loss of consciousness</li>
            <li>Severe bleeding or head injury</li>
            <li>Signs of stroke (facial drooping, arm weakness, speech difficulty)</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .symptom-checker {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .symptom-checker-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .symptom-checker-header h3 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 1.5rem;
        }

        .symptom-checker-header p {
          margin: 0;
          color: #64748b;
          font-size: 0.875rem;
        }

        .symptom-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .symptom-input-section label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
        }

        .symptom-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.5;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .symptom-textarea:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .symptom-textarea:disabled {
          background: #f8fafc;
          cursor: not-allowed;
        }

        .quick-symptoms-section {
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
        }

        .quick-symptoms-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .toggle-quick-symptoms {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .quick-symptoms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .symptom-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .symptom-button:hover {
          background: #f8fafc;
          border-color: #3b82f6;
        }

        .symptom-button.selected {
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;
        }

        .symptom-icon {
          font-size: 1.125rem;
        }

        .symptom-label {
          flex: 1;
          text-align: left;
        }

        .selected-symptoms {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .selected-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .selected-symptoms-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .selected-symptom-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: #3b82f6;
          color: white;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .remove-symptom {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0;
          margin-left: 4px;
        }

        .submit-section {
          text-align: center;
        }

        .check-symptoms-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .check-symptoms-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .check-symptoms-button:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .disclaimer {
          margin-top: 20px;
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
        }

        .disclaimer-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .disclaimer-text {
          font-size: 0.875rem;
          color: #92400e;
          line-height: 1.5;
        }

        .emergency-info {
          margin-top: 16px;
          padding: 16px;
          background: #fef2f2;
          border: 1px solid #ef4444;
          border-radius: 8px;
        }

        .emergency-header {
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 8px;
          font-size: 0.875rem;
        }

        .emergency-list {
          font-size: 0.8rem;
          color: #dc2626;
          line-height: 1.5;
        }

        .emergency-list ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .emergency-list li {
          margin-bottom: 2px;
        }

        @media (max-width: 768px) {
          .quick-symptoms-grid {
            grid-template-columns: 1fr 1fr;
          }

          .symptom-button {
            padding: 8px 10px;
            font-size: 0.8rem;
          }

          .disclaimer {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SymptomChecker;
