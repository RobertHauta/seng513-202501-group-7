function CoursePopup({ onClose, onSubmit }) {
    const [courseName, setCourseName] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(courseName);
    };
  
    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h2>Create New Course</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="course-name">Course Name:</label>
            <input
              type="text"
              id="course-name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
            />
            <div className="popup-buttons">
              <button type="submit">Create Course</button>
              <button type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }