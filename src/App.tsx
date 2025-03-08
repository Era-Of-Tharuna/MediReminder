import React, { useState, useEffect } from 'react';
import { Bell, Clock, Plus, Trash2, Check, X, AlertCircle } from 'lucide-react';

// Types
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  lastTaken: string | null;
  missed: boolean;
}

function App() {
  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('medications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    time: '08:00',
  });
  
  const [showForm, setShowForm] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Save medications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('medications', JSON.stringify(medications));
  }, [medications]);

  // Check for missed medications every minute
  useEffect(() => {
    const checkMedications = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      setMedications(prevMeds => 
        prevMeds.map(med => {
          const [hours, minutes] = med.time.split(':').map(Number);
          const medicationTime = hours * 60 + minutes;
          
          // If the medication time has passed and it hasn't been taken today
          const today = new Date().toLocaleDateString();
          const shouldBeTaken = currentTime >= medicationTime;
          const takenToday = med.lastTaken === today;
          
          if (shouldBeTaken && !takenToday && !med.missed) {
            // Add notification
            setNotifications(prev => [...prev, `Time to take ${med.name} (${med.dosage})`]);
            
            // Request browser notification permission
            if (Notification.permission === 'granted') {
              new Notification('Medication Reminder', {
                body: `Time to take ${med.name} (${med.dosage})`,
                icon: '/vite.svg'
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission();
            }
            
            return { ...med, missed: true };
          }
          return med;
        })
      );
    };

    // Check immediately on load
    checkMedications();
    
    // Set up interval to check every minute
    const interval = setInterval(checkMedications, 60000);
    
    // Request notification permission on component mount
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMedication(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMedication.name || !newMedication.dosage) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newMed: Medication = {
      id: Date.now().toString(),
      ...newMedication,
      lastTaken: null,
      missed: false
    };
    
    setMedications(prev => [...prev, newMed]);
    setNewMedication({
      name: '',
      dosage: '',
      frequency: 'daily',
      time: '08:00',
    });
    setShowForm(false);
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(prev => prev.filter(med => med.id !== id));
  };

  const handleTakeMedication = (id: string) => {
    const today = new Date().toLocaleDateString();
    
    setMedications(prev => 
      prev.map(med => 
        med.id === id 
          ? { ...med, lastTaken: today, missed: false } 
          : med
      )
    );
    
    // Remove related notifications
    const medication = medications.find(med => med.id === id);
    if (medication) {
      setNotifications(prev => 
        prev.filter(note => !note.includes(medication.name))
      );
    }
  };

  const dismissNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Bell className="w-10 h-10 text-indigo-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">MediRemind</h1>
          </div>
          <p className="text-gray-600">Your AI-powered medication reminder system</p>
        </header>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              Reminders
            </h2>
            <div className="space-y-2">
              {notifications.map((note, index) => (
                <div key={index} className="bg-red-50 border-l-4 border-red-500 p-4 flex justify-between items-center">
                  <p className="text-red-700">{note}</p>
                  <button 
                    onClick={() => dismissNotification(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medication List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Medications</h2>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Medication
            </button>
          </div>

          {/* Add Medication Form */}
          {showForm && (
            <form onSubmit={handleAddMedication} className="mb-6 bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medication Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newMedication.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Aspirin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage*
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    value={newMedication.dosage}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 100mg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    name="frequency"
                    value={newMedication.frequency}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="twice-daily">Twice Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as-needed">As Needed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={newMedication.time}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save Medication
                </button>
              </div>
            </form>
          )}

          {/* Medications Table */}
          {medications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medication
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medications.map((med) => (
                    <tr key={med.id} className={med.missed ? "bg-red-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{med.name}</div>
                        <div className="text-sm text-gray-500">{med.dosage}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">
                            {med.time} ({med.frequency})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {med.lastTaken === new Date().toLocaleDateString() ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Taken today
                          </span>
                        ) : med.missed ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Missed
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleTakeMedication(med.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as taken"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedication(med.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete medication"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No medications added yet.</p>
              <p className="text-gray-500 text-sm mt-1">
                Click the "Add Medication" button to get started.
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Add Your Medications</h3>
              <p className="text-sm text-gray-600">
                Enter your medication details including name, dosage, frequency, and time.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Get Reminders</h3>
              <p className="text-sm text-gray-600">
                Receive notifications when it's time to take your medication.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-md">
              <h3 className="font-medium text-purple-800 mb-2">Track Your Progress</h3>
              <p className="text-sm text-gray-600">
                Mark medications as taken and view your adherence history.
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md">
              <h3 className="font-medium text-yellow-800 mb-2">Never Miss a Dose</h3>
              <p className="text-sm text-gray-600">
                The system automatically checks for missed doses and alerts you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;