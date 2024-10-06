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

  // Helper function to determine color based on matching score
  const getNodeColor = (score) => {
    if (score == 100) return '#ffffff'; // Green for high scores
    if (score >= 90) return '#a8c4e0'; // Green for high scores
    if (score >= 80) return '#b0d5f5'; // Green for high scores
    if (score >= 70) return '#658db5'; // Green for high scores
    if (score >= 60) return '#51769c'; // Green for high scores
    if (score >= 50) return '#375b80'; // Green for high scores
    if (score >= 40) return '#234566'; // Green for high scores
    if (score >= 30) return '#15324d'; // Yellow for medium scores
    return '#071929'; // Red for low scores
  };

  // Filter data based on approval status and prepare the graph structure
  const filterApprovedPeople = (name) => {
    const approvedPeople = guestData.filter(person => person.approval_status === 'approved');

    const user = approvedPeople.find(person => person.name === name);

    if (!user) {
      setError('Name not found in the guest list. Please use the exact name you registered under.');
      return null;
    }

    // Generate graph structure: nodes and links with dynamic matching score from `matching_scores`
    const nodes = approvedPeople.map(person => ({
      id: person.name,
      name: person.name,
      group: person.name === name ? 1 : 2, // Group 1 is the user, 2 is everyone else
      description: person.description,
      matchingScore: user.matching_scores[person.name] || 0,
      color: getNodeColor(user.matching_scores[person.name] || 0), // Set color based on score
    }));

    const links = [];
    approvedPeople.forEach(person => {
      if (person.name !== name) {
        const score = user.matching_scores[person.name] || 0;
        links.push({
          source: name,
          target: person.name,
          value: score, // Matching score between the user and this person
          distance: 500 - (score * 10), // Drastically adjust distance, higher score = shorter distance
        });
      }
    });

    return { nodes, links };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear any previous errors

    // Filter the approved people and generate the graph data
    const graphData = filterApprovedPeople(name);
    if (graphData) {
      setFilteredData(graphData);
    }
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
          <h3 style={{ color: 'white' }}>Your Top Matches</h3>
          <ForceGraph3D
            graphData={filteredData}
            nodeAutoColorBy="group"
            nodeLabel={(node) => `${node.name}: ${node.description}`}
            linkDirectionalParticles={4}
            linkDirectionalParticleSpeed={(d) => d.value * 0.001}
            linkDistance={(link) => link.distance} // Use calculated distance
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
              <button className="close-btn" onClick={handleClosePopup}>x</button>
              <h2>{selectedPerson.name}</h2>
              <p>{selectedPerson.description ? selectedPerson.description : 'No description available'}</p>
              {/* You can extend this section to show more details */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchGraph;
