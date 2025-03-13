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
      <h1>Fedora Learning</h1>
      <form>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" name="username" required />
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;