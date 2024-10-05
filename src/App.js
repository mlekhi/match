import React, { useState } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three'; // Import THREE.js for 3D geometry
import './App.css';
import guestData from './data.json'; // Import the JSON data

const MatchGraph = () => {
  const [name, setName] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null); // State for clicked person
  const [error, setError] = useState(''); // State for error message

  // Helper function to calculate matching score between two people
  const calculateMatchingScore = (person1, person2) => {
    const commonInterests = person1.common_interests.filter(interest =>
      person2.common_interests.includes(interest)
    );
    const commonDiscussionTopics = person1.discussion_topics.filter(topic =>
      person2.discussion_topics.includes(topic)
    );

    // Calculate score based on the number of shared interests and discussion topics
    const interestScore = commonInterests.length * 10; // Each common interest gives 10 points
    const discussionScore = commonDiscussionTopics.length * 5; // Each common discussion topic gives 5 points
    return interestScore + discussionScore;
  };

  // Filter data based on approval status and calculate matching scores
  const filterApprovedPeople = (name) => {
    const approvedPeople = guestData.filter(person => person.approval_status === 'approved');

    const user = { id: name, name: name, group: 1, description: 'You', common_interests: [], discussion_topics: [] };

    // Generate graph structure: nodes and links with dynamic matching score
    const nodes = [user];
    const links = [];

    approvedPeople.forEach(person => {
      if (person.name !== name) {
        const matchingScore = calculateMatchingScore(user, person);

        nodes.push({
          id: person.name,
          name: person.name,
          group: 2,
          description: person.description,
          matchingScore
        });

        links.push({
          source: user.name,
          target: person.name,
          value: matchingScore // Use matching score for link strength
        });
      }
    });

    return { nodes, links };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear any previous errors

    // Check if the entered name exists in guestData
    const userExists = guestData.some(person => person.name.toLowerCase() === name.toLowerCase());

    if (!userExists) {
      // If the name is not found in guestData, show an error message
      setError('Name not found in the guest list. Please use the exact name you registered under.');
      setLoading(false);
      return;
    }

    // Filter the approved people and generate the graph data
    const graphData = filterApprovedPeople(name);
    setFilteredData(graphData);
    setLoading(false);
  };

  // Handle node click
  const handleNodeClick = (node) => {
    setSelectedPerson(node); // Set the clicked person to show their info
  };

  // Close popup
  const handleClosePopup = () => {
    setSelectedPerson(null); // Close the popup
  };

  return (
    <div className="app-container">
      {!filteredData ? (
        <form onSubmit={handleSubmit} className="login-form">
          <img src="logo.png" style={{ width: '150px', height: 'auto' }} alt="Logo" />
          <h2>Find Your Matches</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            className="input-field"
          />
          <button type="submit" className="submit-btn">
            {loading ? 'Loading...' : 'Find Matches'}
          </button>
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </form>
      ) : (
        <div className="graph-container">
          <h3>Your Top Matches</h3>
          <ForceGraph3D
            graphData={filteredData}
            nodeAutoColorBy="group"
            nodeLabel={(node) => `${node.name}: Matching Score ${node.matchingScore}`}
            linkDirectionalParticles={4}
            linkDirectionalParticleSpeed={(d) => d.value * 0.001}
            onNodeClick={handleNodeClick} // Add click handler
            nodeThreeObject={(node) => {
              // Create a sphere geometry for each node (to make them circular)
              const sphereGeometry = new THREE.SphereGeometry(8, 16, 16); // Radius 8, smoothness 16x16
              const material = new THREE.MeshBasicMaterial({ color: node.color || '#1e3c66' });
              const sphere = new THREE.Mesh(sphereGeometry, material);
              return sphere;
            }}
            width={window.innerWidth} // Full width of the window
            height={window.innerHeight - 100} // Full height minus the header
          />

          {/* Popup for person details */}
          {selectedPerson && (
            <div className="person-popup">
              <button className="close-btn" onClick={handleClosePopup}>X</button>
              <h2>{selectedPerson.name}</h2>
              <p>{selectedPerson.description ? selectedPerson.description : 'No description available'}</p>
              <p><strong>Matching Score:</strong> {selectedPerson.matchingScore}</p>
              <p><strong>Common Interests:</strong> {selectedPerson.common_interests.join(', ')}</p>
              <p><strong>Discussion Topics:</strong> {selectedPerson.discussion_topics.join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchGraph;
