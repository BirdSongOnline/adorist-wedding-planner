import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Users, 
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Save,
  X,
  LogOut,
  Settings,
  BarChart3
} from 'lucide-react';
import { authFunctions, dbFunctions, subscriptions, Task, Vendor, Guest, Profile } from '../lib/supabase';

interface WeddingPlannerProps {
  onSignOut: () => void;
}

export default function WeddingPlanner({ onSignOut }: WeddingPlannerProps) {
  const [activeTab, setActiveTab] = useState('checklist');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [newVendor, setNewVendor] = useState({
    name: '',
    type: '',
    email: '',
    phone: '',
    cost: '',
    notes: ''
  });

  const [newGuest, setNewGuest] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    group_name: '',
    rsvp_status: 'pending',
    plus_one: '',
    table_number: null as number | null,
    dietary_restrictions: ''
  });

  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [editingGuest, setEditingGuest] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const tasksSub = subscriptions.subscribeTasks(setTasks);
    const vendorsSub = subscriptions.subscribeVendors(setVendors);
    const guestsSub = subscriptions.subscribeGuests(setGuests);

    return () => {
      tasksSub.unsubscribe();
      vendorsSub.unsubscribe();
      guestsSub.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, tasksData, vendorsData, guestsData] = await Promise.all([
        authFunctions.getCurrentProfile(),
        dbFunctions.getTasks(),
        dbFunctions.getVendors(),
        dbFunctions.getGuests()
      ]);

      setProfile(profileData);
      setTasks(tasksData);
      setVendors(vendorsData);
      setGuests(guestsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authFunctions.signOut();
      onSignOut();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      await dbFunctions.updateTask(taskId, completed);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const saveVendor = async () => {
    if (!newVendor.name || !newVendor.type) return;

    try {
      await dbFunctions.addVendor(newVendor);
      setNewVendor({
        name: '',
        type: '',
        email: '',
        phone: '',
        cost: '',
        notes: ''
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteVendor = async (id: string) => {
    try {
      await dbFunctions.deleteVendor(id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const saveGuest = async () => {
    if (!newGuest.first_name || !newGuest.last_name) return;

    try {
      await dbFunctions.addGuest(newGuest);
      setNewGuest({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        group_name: '',
        rsvp_status: 'pending',
        plus_one: '',
        table_number: null,
        dietary_restrictions: ''
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteGuest = async (id: string) => {
    try {
      await dbFunctions.deleteGuest(id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateProgress = () => {
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getTasksByPhase = () => {
    const phases = [
      '12+ Months Before',
      '8-12 Months Before',
      '4-8 Months Before',
      '2-4 Months Before',
      '1-2 Months Before',
      '1 Week Before'
    ];

    return phases.map(phase => ({
      phase,
      tasks: tasks.filter(task => task.phase === phase)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-rose-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading your wedding planner...</p>
        </div>
      </div>
    );
  }

  const progress = updateProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-rose-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Adorist</h1>
                <p className="text-sm text-gray-600">{profile?.couple_names}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{progress}% Complete</p>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-rose-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'checklist', label: 'Checklist', icon: CheckCircle2 },
              { id: 'vendors', label: 'Vendors', icon: DollarSign },
              { id: 'guests', label: 'Guest List', icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
            <button onClick={() => setError('')} className="float-right">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-8">
            {getTasksByPhase().map(({ phase, tasks: phaseTasks }) => (
              <div key={phase} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{phase}</h3>
                  <p className="text-sm text-gray-600">
                    {phaseTasks.filter(t => t.completed).length} of {phaseTasks.length} completed
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {phaseTasks.map(task => (
                      <div key={task.id} className="flex items-center">
                        <button
                          onClick={() => toggleTask(task.id, !task.completed)}
                          className="mr-3 transition-colors"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-rose-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 hover:text-rose-600" />
                          )}
                        </button>
                        <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.task_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="space-y-6">
            {/* Add Vendor Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Vendor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Vendor Name"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Type (e.g., Photographer)"
                  value={newVendor.type}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newVendor.phone}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, phone: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Cost"
                  value={newVendor.cost}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, cost: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Notes"
                  value={newVendor.notes}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, notes: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={saveVendor}
                className="mt-4 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </button>
            </div>

            {/* Vendors List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map(vendor => (
                <div key={vendor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{vendor.name}</h4>
                      <p className="text-sm text-gray-600">{vendor.type}</p>
                    </div>
                    <button
                      onClick={() => deleteVendor(vendor.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {vendor.email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {vendor.email}
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {vendor.phone}
                      </div>
                    )}
                    {vendor.cost && (
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        {vendor.cost}
                      </div>
                    )}
                    {vendor.notes && (
                      <p className="text-gray-600 mt-2">{vendor.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <div className="space-y-6">
            {/* Add Guest Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Guest</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={newGuest.first_name}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, first_name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newGuest.last_name}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, last_name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, phone: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Group (e.g., Family)"
                  value={newGuest.group_name}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, group_name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <select
                  value={newGuest.rsvp_status}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, rsvp_status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="attending">Attending</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <button
                onClick={saveGuest}
                className="mt-4 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Guest
              </button>
            </div>

            {/* Guest Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-900">{guests.length}</div>
                <div className="text-sm text-gray-600">Total Guests</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-green-600">
                  {guests.filter(g => g.rsvp_status === 'attending').length}
                </div>
                <div className="text-sm text-gray-600">Attending</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-red-600">
                  {guests.filter(g => g.rsvp_status === 'declined').length}
                </div>
                <div className="text-sm text-gray-600">Declined</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {guests.filter(g => g.rsvp_status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>

            {/* Guests List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Group
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RSVP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guests.map(guest => (
                      <tr key={guest.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {guest.first_name} {guest.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{guest.email}</div>
                          <div className="text-sm text-gray-500">{guest.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guest.group_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            guest.rsvp_status === 'attending' 
                              ? 'bg-green-100 text-green-800'
                              : guest.rsvp_status === 'declined'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {guest.rsvp_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => deleteGuest(guest.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
