import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [activeCall, setActiveCall] = useState(null);
  const [callRemarks, setCallRemarks] = useState('');
  const [requirementStatus, setRequirementStatus] = useState('requirement');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/properties`);
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setUploadStatus('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BACKEND_URL}/api/upload-excel`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus(`✅ ${result.message}`);
        fetchProperties(); // Refresh properties list
      } else {
        setUploadStatus(`❌ Error: ${result.detail}`);
      }
    } catch (error) {
      setUploadStatus(`❌ Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const initiateContact = async (property, contactType) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/initiate-contact?property_id=${property.id}&contact_type=${contactType}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        if (contactType === 'whatsapp') {
          // Open WhatsApp with pre-filled message
          const message = `Hi! I'm interested in the property: ${property.name} located at ${property.location}. Price: ${property.pricing}. Can we discuss this?`;
          const whatsappUrl = `https://wa.me/${property.number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        } else {
          // For call - show call interface
          setActiveCall({
            callId: result.call_id,
            property: property,
            startTime: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error initiating contact:', error);
    }
  };

  const startCall = (property) => {
    // Simulate call start - in real implementation, this would use WebRTC
    const phoneNumber = property.number.replace(/\D/g, '');
    window.open(`tel:${phoneNumber}`, '_self');
    
    // Also set up the call tracking
    initiateContact(property, 'call');
  };

  const endCall = async () => {
    if (!activeCall) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/update-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_id: activeCall.callId,
          remarks: callRemarks,
          requirement_status: requirementStatus,
        }),
      });

      if (response.ok) {
        setActiveCall(null);
        setCallRemarks('');
        setRequirementStatus('requirement');
        alert('Call updated successfully!');
      }
    } catch (error) {
      console.error('Error updating call:', error);
    }
  };

  const clearProperties = async () => {
    if (window.confirm('Are you sure you want to clear all properties?')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/properties`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setProperties([]);
          setUploadStatus('✅ All properties cleared');
        }
      } catch (error) {
        console.error('Error clearing properties:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Real Estate Hub</h1>
                <p className="text-gray-600">Property Management & Communication Platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Upload Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Property Data</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mb-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-indigo-600 font-semibold hover:text-indigo-500">Upload Excel file</span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={loading}
              />
            </div>
            <p className="text-sm text-gray-500">
              Required columns: name, number, location, pricing, requirements, remarks
            </p>
          </div>
          
          {loading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Processing file...</span>
            </div>
          )}
          
          {uploadStatus && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50">
              <p className="text-sm">{uploadStatus}</p>
            </div>
          )}

          <div className="mt-4 flex space-x-4">
            <button
              onClick={clearProperties}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Properties
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        {properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                  <h3 className="text-xl font-bold text-white">{property.name}</h3>
                  <p className="text-indigo-100">{property.location}</p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-green-600">{property.pricing}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{property.number}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p><strong>Requirements:</strong> {property.requirements}</p>
                      <p><strong>Remarks:</strong> {property.remarks}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => initiateContact(property, 'whatsapp')}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      WhatsApp
                    </button>
                    
                    <button
                      onClick={() => startCall(property)}
                      className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call Management Modal */}
        {activeCall && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Call Management</h3>
              <p className="text-gray-600 mb-4">
                Call with: <strong>{activeCall.property.name}</strong>
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Remarks
                  </label>
                  <textarea
                    value={callRemarks}
                    onChange={(e) => setCallRemarks(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                    placeholder="Enter call remarks..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirement Status
                  </label>
                  <select
                    value={requirementStatus}
                    onChange={(e) => setRequirementStatus(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="requirement">Has Requirement</option>
                    <option value="no_requirement">No Requirement</option>
                    <option value="future_requirement">Future Requirement</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={endCall}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  End Call & Save
                </button>
                <button
                  onClick={() => setActiveCall(null)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {properties.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-500">Upload an Excel file to get started with your property listings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;