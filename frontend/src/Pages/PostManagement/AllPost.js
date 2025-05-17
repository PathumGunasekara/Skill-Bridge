import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoSend } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { BiSolidLike } from "react-icons/bi";
import Modal from 'react-modal';
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { GrUpdate } from "react-icons/gr";
import { FiSave } from "react-icons/fi";
import { TbPencilCancel } from "react-icons/tb";
import { FaCommentAlt } from "react-icons/fa";
import './AddNewPost.css';
Modal.setAppElement('#root');

function AllPost() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postOwners, setPostOwners] = useState({});
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]); // State to track followed users
  const [newComment, setNewComment] = useState({}); // State for new comments
  const [editingComment, setEditingComment] = useState({}); // State for editing comments
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const navigate = useNavigate();
  const loggedInUserID = localStorage.getItem('userID'); // Get the logged-in user's ID

  useEffect(() => {
    // Fetch all posts from the backend
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/posts');
        setPosts(response.data);
        setFilteredPosts(response.data); // Initially show all posts

        // Fetch post owners' names
        const userIDs = [...new Set(response.data.map((post) => post.userID))]; // Get unique userIDs
        const ownerPromises = userIDs.map((userID) =>
          axios.get(`http://localhost:8080/user/${userID}`)
            .then((res) => ({
              userID,
              fullName: res.data.fullname,
            }))
            .catch((error) => {
              if (error.response && error.response.status === 404) {
                // Handle case where user is deleted
                console.warn(`User with ID ${userID} not found. Removing their posts.`);
                setPosts((prevPosts) => prevPosts.filter((post) => post.userID !== userID));
                setFilteredPosts((prevFilteredPosts) => prevFilteredPosts.filter((post) => post.userID !== userID));
              } else {
                console.error(`Error fetching user details for userID ${userID}:`, error);
              }
              return { userID, fullName: 'Anonymous' };
            })
        );
        const owners = await Promise.all(ownerPromises);
        const ownerMap = owners.reduce((acc, owner) => {
          acc[owner.userID] = owner.fullName;
          return acc;
        }, {});
        console.log('Post Owners Map:', ownerMap); // Debug log to verify postOwners map
        setPostOwners(ownerMap);
      } catch (error) {
        console.error('Error fetching posts:', error); // Log error for fetching posts
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      const userID = localStorage.getItem('userID');
      if (userID) {
        try {
          const response = await axios.get(`http://localhost:8080/user/${userID}/followedUsers`);
          setFollowedUsers(response.data);
        } catch (error) {
          console.error('Error fetching followed users:', error);
        }
      }
    };

    fetchFollowedUsers();
  }, []);

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) {
      return; // Exit if the user cancels the confirmation
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${postId}`);
      alert('Post deleted successfully!');
      setPosts(posts.filter((post) => post.id !== postId)); // Remove the deleted post from the UI
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId)); // Update filtered posts
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  const handleUpdate = (postId) => {
    navigate(`/updatePost/${postId}`); // Navigate to the UpdatePost page with the post ID
  };

  const handleMyPostsToggle = () => {
    if (showMyPosts) {
      // Show all posts
      setFilteredPosts(posts);
    } else {
      // Filter posts by logged-in user ID
      setFilteredPosts(posts.filter((post) => post.userID === loggedInUserID));
    }
    setShowMyPosts(!showMyPosts); // Toggle the state
  };

  //Process of the handleLike
  const handleLike = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to like a post.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8080/posts/${postId}/like`, null, {
        params: { userID },
      });

      // update specific  post's likes in the state 
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleFollowToggle = async (postOwnerID) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to follow/unfollow users.');
      return;
    }
    try {
      if (followedUsers.includes(postOwnerID)) {
        // Unfollow logic
        await axios.put(`http://localhost:8080/user/${userID}/unfollow`, { unfollowUserID: postOwnerID });
        setFollowedUsers(followedUsers.filter((id) => id !== postOwnerID));
      } else {
        // Follow logic
        await axios.put(`http://localhost:8080/user/${userID}/follow`, { followUserID: postOwnerID });
        setFollowedUsers([...followedUsers, postOwnerID]);
      }
    } catch (error) {
      console.error('Error toggling follow state:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to comment.');
      return;
    }
    const content = newComment[postId] || ''; // Get the comment content for the specific post
    if (!content.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8080/posts/${postId}/comment`, {
        userID,
        content,
      });

      // Update the specific post's comments in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );

      setNewComment({ ...newComment, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const userID = localStorage.getItem('userID');
    try {
      await axios.delete(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        params: { userID },
      });

      // Update state to remove the deleted comment
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleSaveComment = async (postId, commentId, content) => {
    try {
      const userID = localStorage.getItem('userID');
      await axios.put(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        userID,
        content,
      });

      // updating the comment in state
      // update the specific post's comments in the state
      // update comment content
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? { ...comment, content } : comment
              ),
            }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? { ...comment, content } : comment
              ),
            }
            : post
        )
      );

      setEditingComment({}); // Clear editing state
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter posts based on title, description, or category
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        (post.category && post.category.toLowerCase().includes(query))
    );
    setFilteredPosts(filtered);
  };

  const openModal = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  };

  return (
    <div className="dark-container">
      <div className='continer'>
        <NavBar />
        <div className='post-content'>
          <div className="floating-search-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="    What are you looking for?"
                value={searchQuery}
                onChange={handleSearch}
                className="floating-search"
              />
              <i className="search-icon">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </i>
            </div>
            <div className="search-actions">
              <button
                className={`view-toggle-btn ${!showMyPosts ? 'active' : ''}`}
                onClick={handleMyPostsToggle}
              >
                {showMyPosts ? 'View All Posts' : 'View My Posts'}
              </button>
              <button
                className="create-new-btn"
                onClick={() => (window.location.href = '/addNewPost')}
              >
                <span>+</span> Create Post
              </button>
            </div>
          </div>

          <div className='posts-container modern'>
            {filteredPosts.length === 0 ? (
              <div className='empty-state-box modern'>
                <div className='empty-icon'>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 3h-3v3h3V6zm0 4h-3v3h3v-3zm-4-4h-3v3h3V6zm0 4h-3v3h3v-3zm-4-4H6v3h3V6zm0 4H6v3h3v-3zm10 4H6v3h13v-3z" />
                  </svg>
                </div>
                <h2>No Posts Found</h2>
                <p>Be the first to share something with the community</p>
                <button className='create-btn modern' onClick={() => (window.location.href = '/addNewPost')}>
                  Create Your First Post
                </button>
              </div>
            ) : (
              <div className='posts-grid'>
                {filteredPosts.map((post) => (
                  <div key={post.id} className='post-card'>
                    <div className='post-header'>
                      <div className='user-info'>
                        <div className='avatar'>
                          {postOwners[post.userID]?.charAt(0) || 'A'}
                        </div>
                        <div className='user-details'>
                          <h4>{postOwners[post.userID] || 'Anonymous'}</h4>
                          <span className='category-tag'>{post.category || 'General'}</span>
                        </div>
                      </div>
                      <div className='action-buttons'>
                        {post.userID === loggedInUserID ? (
                          <div className='owner-actions'>
                            <button className='icon-btn edit' onClick={() => handleUpdate(post.id)}>
                              <FaEdit />
                            </button>
                            <button className='icon-btn delete' onClick={() => handleDelete(post.id)}>
                              <RiDeleteBin6Fill />
                            </button>
                          </div>
                        ) : (
                          <button
                            className={`follow-button ${followedUsers.includes(post.userID) ? 'following' : ''}`}
                            onClick={() => handleFollowToggle(post.userID)}
                          >
                            {followedUsers.includes(post.userID) ? '✓ Following' : '+ Follow'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className='post-body'>
                      <h3 className='post-title'>{post.title}</h3>
                      <p className='post-text'>{post.description}</p>
                    </div>

                    {post.media.length > 0 && (
                      <div className='media-gallery'>
                        {post.media.slice(0, 4).map((mediaUrl, index) => (
                          <div
                            key={index}
                            className={`media-preview ${post.media.length > 4 && index === 3 ? 'with-overlay' : ''}`}
                            onClick={() => openModal(mediaUrl)}
                          >
                            {mediaUrl.endsWith('.mp4') ? (
                              <div className='video-thumb'>
                                <video>
                                  <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                                </video>
                                <span className='video-icon'>▶</span>
                              </div>
                            ) : (
                              <img src={`http://localhost:8080${mediaUrl}`} alt="" />
                            )}
                            {post.media.length > 4 && index === 3 && (
                              <div className='more-overlay'>
                                <span>+{post.media.length - 4}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className='post-footer'>
                      <div className='engagement'>
                        <button
                          className={`like-btn ${post.likes?.[localStorage.getItem('userID')] ? 'active' : ''}`}
                          onClick={() => handleLike(post.id)}
                        >
                          <BiSolidLike />
                          <span>{Object.values(post.likes || {}).filter(liked => liked).length}</span>
                        </button>
                        <div className='comment-indicator'>
                          <FaCommentAlt />
                          <span>{post.comments?.length || 0}</span>
                        </div>
                      </div>

                      <div className='comments'>
                        <div className='comment-form'>
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                          />
                          <button className='send-btn' onClick={() => handleAddComment(post.id)}>
                            <IoSend />
                          </button>
                        </div>

                        <div className='comments-section'>
                          {post.comments?.map((comment) => (
                            <div key={comment.id} className='comment'>
                              <div className='comment-header'>
                                <strong>{comment.userFullName}</strong>
                                {(comment.userID === loggedInUserID || post.userID === loggedInUserID) && (
                                  <div className='comment-controls'>
                                    {comment.userID === loggedInUserID && (
                                      editingComment.id === comment.id ? (
                                        <>
                                          <button className='icon-btn' onClick={() =>
                                            handleSaveComment(post.id, comment.id, editingComment.content)}>
                                            <FiSave />
                                          </button>
                                          <button className='icon-btn' onClick={() => setEditingComment({})}>
                                            <TbPencilCancel />
                                          </button>
                                        </>
                                      ) : (
                                        <button className='icon-btn' onClick={() =>
                                          setEditingComment({ id: comment.id, content: comment.content })}>
                                          <GrUpdate />
                                        </button>
                                      )
                                    )}
                                    <button className='icon-btn' onClick={() =>
                                      handleDeleteComment(post.id, comment.id)}>
                                      <MdDelete />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {editingComment.id === comment.id ? (
                                <input
                                  type="text"
                                  className='edit-comment'
                                  value={editingComment.content}
                                  onChange={(e) => setEditingComment({
                                    ...editingComment,
                                    content: e.target.value
                                  })}
                                  autoFocus
                                />
                              ) : (
                                <p className='comment-text'>{comment.content}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Media Modal"
        className="modern-media-modal"
        overlayClassName="modern-modal-overlay"
      >
        <button className="modern-close-btn" onClick={closeModal}>×</button>
        {selectedMedia && selectedMedia.endsWith('.mp4') ? (
          <video controls className="modal-content">
            <source src={`http://localhost:8080${selectedMedia}`} type="video/mp4" />
          </video>
        ) : (
          <img src={`http://localhost:8080${selectedMedia}`} alt="Full size" className="modal-content" />
        )}
      </Modal>
    </div >
  );
}

export default AllPost;
