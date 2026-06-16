import {useState, useEffect} from 'react';
import API from '../../services/api';
import AdminLayout from './AdminLayout';
import {MdSearch} from 'react-icons/md'

function AdminModal() {
    const [students, setStudents] = useState([]);
    const [editng, setEditing] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );


    useEffect(() => {
        fetchStudents();}, [])

    const fetchStudents = async () => {
        try {
            const res = await API.get('/users/students')
            setStudents(res.data)
        } catch (err) { console.error(err) } }

        return (
             <AdminLayout activePage="Students">
                <p className="text-sm text-gray-400">{filteredStudents.length} Students</p>
                <div className="p-4 sm:p-6">
                    <h1 className="text-xl font-bold text-gray-800 mb-4">Student List</h1>
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MdSearch className="text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {(() => {
                        if (searchTerm.trim() === '') return students;
                        const lower = searchTerm.toLowerCase();
                        return students.filter(s =>
                            s.name.toLowerCase().includes(lower) ||
                            s.email.toLowerCase().includes(lower)
                        );})
                    }
                    <div className="flex flex-col gap-4">
                        {filteredStudents.length === 0 ? (
                            <p className="text-gray-500">No students found.</p>
                        ) : (
                            filteredStudents.map(s => (
                                <div key={s._id} className="bg-gray-100 p-4 rounded-lg">
                                    <h3 className="font-bold">{s.name}</h3>
                                    <p className="text-gray-600">{s.email}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </AdminLayout>
        )
}
export default AdminModal;