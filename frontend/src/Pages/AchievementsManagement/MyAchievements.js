import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";

function MyAchievements() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showMyPosts, setShowMyPosts] = useState(false); // Track filter mode
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetch('http://localhost:8080/achievements')
      .then((response) => response.json())
      .then((data) => {
        const userFilteredData = data.filter((achievement) => achievement.postOwnerID === userId);
        setProgressData(userFilteredData);
        //setFilteredData(userFilteredData); 
        setFilteredData(userFilteredData); // Initially show filtered data
      })
      .catch((error) => console.error('Error fetching Achievements data:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Achievements?')) {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Achievements deleted successfully!');
          setFilteredData(filteredData.filter((progress) => progress.id !== id));
        } else {
          alert('Failed to delete Achievements.');
        }
      } catch (error) {
        console.error('Error deleting Achievements:', error);
      }
    }
  };

  return (
    <div className="dark-container">
      <div className='continer'>
        <NavBar />
        <div className='post-content'>
          <div className="floating-search-container">
            <div className="search-actions">
              <button 
                className="create-new-btn" 
                onClick={() => (window.location.href = '/addAchievements')}
              >
                <span>+</span> Create Achievement
              </button>
            </div>
          </div>
          
          <div className='posts-container modern'>
            {filteredData.length === 0 ? (
              <div className='empty-state-box modern'>
                <div className='empty-icon'>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 3h-3v3h3V6zm0 4h-3v3h3v-3zm-4-4h-3v3h3V6zm0 4h-3v3h3v-3zm-4-4H6v3h3V6zm0 4H6v3h3v-3zm10 4H6v3h13v-3z"/>
                  </svg>
                </div>
                <h2>No Achievements Found</h2>
                <p>Share your first achievement</p>
                <button className='create-btn modern' onClick={() => (window.location.href = '/addAchievements')}>
                  Create Your First Achievement
                </button>
              </div>
            ) : (
              <div className='posts-grid'>
                {filteredData.map((achievement) => (
                  <div key={achievement.id} className='post-card'>
                    <div className='post-header'>
                      <div className='user-info'>
                        <div className='avatar'>
                          {achievement.postOwnerName?.charAt(0) || 'A'}
                        </div>
                        <div className='user-details'>
                          <h4>{achievement.postOwnerName || 'Anonymous'}</h4>
                          <span className='date_card_dte'>{achievement.date}</span>
                        </div>
                      </div>
                      {achievement.postOwnerID === userId && (
                        <div className='action-buttons'>
                          <div className='owner-actions'>
                            <button className='icon-btn edit' onClick={() => window.location.href = `/updateAchievements/${achievement.id}`}>
                              <FaEdit />
                            </button>
                            <button className='icon-btn delete' onClick={() => handleDelete(achievement.id)}>
                              <RiDeleteBin6Fill />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='post-body'>
                      <h3 className='post-title'>{achievement.title}</h3>
                      <p className='post-text' style={{ whiteSpace: "pre-line" }}>{achievement.description}</p>
                      {achievement.imageUrl && (
                        <div className='media-gallery'>
                          <div className='media-preview'>
                            <img 
                              src={`http://localhost:8080/achievements/images/${achievement.imageUrl}`} 
                              alt="Achievement" 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAchievements;
