import React, { useEffect, useState } from 'react';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the server
    fetch('http://localhost:5000/api')
      .then(response => response.json())
      .then(data => {
        setUsers(data.users);  // Set the users data
        setLoading(false);  // Set loading to false once data is fetched
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <h1>Users List</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {users.map((user, index) => (
            <li key={index}>id: {user.id} - name: {user.name} - value: {user.value} </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;